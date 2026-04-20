const { src, dest, watch, series, parallel } = require("gulp");

const srcBase = "../src";
const distBase = "../dist";
const srcPath = {
  css: `${srcBase}/sass/**/*.scss`,
  cssVendor: `${srcBase}/css/**/*.css`, // CSSライブラリファイルをそのままコピー
  img: srcBase + "/images/**/*",
  html: `${srcBase}/**/*.html`,
  js: [
    `${srcBase}/js/**/*.js`,
    `!${srcBase}/js/**/*.min.js`, // すべてのminファイルを除外
  ],
};
const distPath = {
  css: distBase + "/css/",
  img: distBase + "/images/",
  html: distBase + "/",
  js: distBase + "/js/",
};

// ローカルサーバー立ち上げ
const browserSync = require("browser-sync");
const browserSyncOption = {
  server: distBase, // サーバーのルートディレクトリ
};
const browserSyncFunc = () => {
  browserSync.init(browserSyncOption); // Browsersyncの初期化
};
const browserSyncReload = (done) => {
  browserSync.reload(); // ページのリロード
  done();
};

// Sassコンパイル
const gulpSass = require("gulp-sass");
const dartSass = require("sass");
const sass = gulpSass(dartSass);
const sassGlob = require("gulp-sass-glob-use-forward");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssDeclarationSorter = require("css-declaration-sorter");
const sourcemaps = require("gulp-sourcemaps");
const cleanCSS = require("gulp-clean-css");
const rename = require("gulp-rename");
const uglify = require("gulp-uglify");
const beautify = require("gulp-beautify");
const replace = require("gulp-replace");

//★ rem→pxフォールバック設定
// true: フォールバックあり（px + rem）、false: フォールバックなし（remのみ）
const REM_FALLBACK_ENABLED = false; // ← ここをtrue/falseで切り替え
const REM_BASE_SIZE = 16; // 1rem = 16px

// rem→pxフォールバック用のカスタムPostCSSプラグイン（有効時のみ）
const postcssRemFallback = () => {
  return {
    postcssPlugin: "postcss-rem-fallback",
    Declaration(decl) {
      // rem値を持つプロパティのみ処理
      if (decl.value && decl.value.includes("rem")) {
        const remRegex = /(-?\d*\.?\d+)rem/g;
        let newValue = decl.value;
        let hasRem = false;

        // rem値をpx値に変換
        newValue = newValue.replace(remRegex, (match, num) => {
          hasRem = true;
          const pxValue = parseFloat(num) * REM_BASE_SIZE;
          return `${pxValue}px`;
        });

        // remが含まれている場合、フォールバックとしてpxを追加
        if (hasRem) {
          const fallbackDecl = decl.clone();
          fallbackDecl.value = newValue;
          decl.parent.insertBefore(decl, fallbackDecl);
        }
      }
    },
  };
};
postcssRemFallback.postcss = true;

// ブラウザ対応設定
const browsers = [
  "last 2 versions",
  "> 1%",
  "not dead",
  "not ie <= 10",
];

// Sassコンパイル（開発用：通常版のみ）
const cssSass = () => {
  return src(srcPath.css)
    .pipe(
      plumber({
        errorHandler: notify.onError("Error:<%= error.message %>"),
      })
    )
    .pipe(sourcemaps.init()) // ソースマップ開始
    .pipe(sassGlob())
    .pipe(
      sass.sync({
        includePaths: ["src/sass"],
        outputStyle: "expanded",
        silenceDeprecations: ["legacy-js-api"], // レガシーAPI警告を非表示
      })
    )
    .pipe(
      postcss(
        (() => {
          const plugins = [
            autoprefixer({
              overrideBrowserslist: browsers,
              cascade: false, // CSSを整形しない
              grid: "autoplace", // CSS Gridのサポート
            }),
          ];
          // rem→pxフォールバック（REM_FALLBACK_ENABLED=trueの場合のみ追加）
          if (REM_FALLBACK_ENABLED) {
            plugins.push(postcssRemFallback());
          }
          plugins.push(cssDeclarationSorter({
            order: "alphabetical", // アルファベット順に整理
          }));
          return plugins;
        })()
      )
    )
    .pipe(
      beautify.css({
        indent_size: 2,
        indent_char: " ",
      })
    )
    .pipe(sourcemaps.write("./")) // インラインソースマップ
    .pipe(dest(distPath.css)) // styles.css + styles.css.map を出力（開発用）
    .pipe(
      notify({
        message: "Sassをコンパイルしたで〜！",
        onLast: true,
      })
    );
};

// CSS圧縮タスク（ビルド用：minified版を生成）
const cssMinify = () => {
  return src(`${distPath.css}styles.css`) // コンパイル済みのCSSを読み込み
    .pipe(
      cleanCSS({
        compatibility: "ie11",
        level: {
          1: {
            specialComments: 0,
          },
        },
      })
    )
    .pipe(rename({ suffix: ".min" }))
    .pipe(dest(distPath.css)) // styles.min.css を出力（ソースマップなし）
    .pipe(
      notify({
        message: "CSSを圧縮したで〜！",
        onLast: true,
      })
    );
};

// ベンダーCSSファイルをそのまま出力（CDNファイル用）
const cssCopy = (done) => {
  src(srcPath.cssVendor, { allowEmpty: true })
    .pipe(
      plumber({
        errorHandler: notify.onError("Error:<%= error.message %>"),
      })
    )
    .pipe(dest(distPath.css));
  done();
};

const imagemin = require("gulp-imagemin");
const imageminMozjpeg = require("imagemin-mozjpeg");
const imageminPngquant = require("imagemin-pngquant");
const imageminSvgo = require("imagemin-svgo");
const webp = require("gulp-webp");

const imgImagemin = () => {
  return src(srcPath.img)
    .pipe(
      imagemin(
        [
          imageminMozjpeg({
            quality: 80,
          }),
          imageminPngquant(),
          imageminSvgo({
            plugins: [
              {
                removeViewbox: false,
              },
            ],
          }),
        ],
        {
          verbose: true,
        }
      )
    )
    .pipe(dest(distPath.img))
    .pipe(webp())
    .pipe(dest(distPath.img));
};

// JavaScript処理（開発用：通常版のみ）
const jsBuild = () => {
  return src(srcPath.js)
    .pipe(
      plumber({
        errorHandler: notify.onError("Error:<%= error.message %>"),
      })
    )
    .pipe(
      beautify.js({
        indent_size: 2,
        indent_char: " ",
      })
    )
    .pipe(dest(distPath.js))
    .pipe(
      notify({
        message: "JavaScriptをコンパイルしたで〜！",
        onLast: true,
      })
    );
};

// JavaScript圧縮タスク（ビルド用：minified版を生成）
const jsMinify = () => {
  // srcから直接読み込む（dist内の既存ファイルに影響されない）
  return src(srcPath.js)
    .pipe(
      plumber({
        errorHandler: notify.onError("Error:<%= error.message %>"),
      })
    )
    .pipe(uglify())
    .pipe(rename({ suffix: ".min" }))
    .pipe(dest(distPath.js))
    .pipe(
      notify({
        message: "JavaScriptを圧縮したで〜！",
        onLast: true,
      })
    );
};

// ライブラリファイル（min.js）をそのまま出力（整形処理なし）
const jsCopy = (done) => {
  // 既存のライブラリminファイルを削除してからコピー（.min.min.jsの生成を防ぐ）
  // script.min.jsはビルドで生成されるので除外
  del([`${distPath.js}swiper-*.min.js`], { force: true }).then(() => {
    src(`${srcBase}/js/**/*.min.js`, { allowEmpty: true })
      .pipe(
        plumber({
          errorHandler: notify.onError("Error:<%= error.message %>"),
        })
      )
      .pipe(dest(distPath.js));
    done();
  });
};

// HTMLファイルをコピー（環境変数に応じてパスを置換）
const htmlCopy = (isProductionMode = false) => {
  // 引数が渡されていない場合は環境変数をチェック
  // Gulpのタスクとして呼ばれた場合、doneコールバックが渡される可能性があるので、型チェック
  const isProduction = (typeof isProductionMode === "boolean" && isProductionMode) || process.env.NODE_ENV === "production";
  let stream = src(srcPath.html)
    .pipe(
      plumber({
        errorHandler: notify.onError("Error:<%= error.message %>"),
      })
    );

  // 開発時のみ、.min.css/.min.jsを通常版に置換
  if (!isProduction) {
    stream = stream
      .pipe(replace(/\.min\.css/g, ".css")) // styles.min.css → styles.css
      .pipe(replace(/\.min\.js/g, ".js")); // script.min.js → script.js
  }

  return stream
    .pipe(
      beautify.html({
        indent_size: 2,
        indent_char: " ",
        max_preserve_newlines: 1,
        preserve_newlines: true,
        wrap_line_length: 0, // 自動折り返しなし
        unformatted: [], // すべての要素を整形
        content_unformatted: ['pre', 'textarea'], // preとtextareaのみ内容を整形しない
        extra_liners: [], // 追加の改行なし
      })
    )
    .pipe(dest(distPath.html));
};

// ファイルの変更を検知（開発用：通常版のみ）
const watchFiles = () => {
  watch(srcPath.css, series(cssSass, browserSyncReload)); // CSSファイルの変更を監視（通常版のみ）
  watch(srcPath.cssVendor, series(cssCopy, browserSyncReload)); // CSSライブラリファイルの変更を監視
  watch(srcPath.img, series(imgImagemin, browserSyncReload)); // 画像ファイルの変更を監視
  watch(srcPath.js, series(jsBuild, browserSyncReload)); // JSファイルの変更を監視（通常版のみ）
  watch(`${srcBase}/js/**/*.min.js`, series(jsCopy, browserSyncReload)); // ライブラリファイルの変更を監視
  watch(srcPath.html, series(htmlCopy, browserSyncReload)); // HTMLファイルの変更を監視
};

const del = require("del");
const delPath = {
  css: [
    `${distBase}/css/styles.css`,
    `${distBase}/css/styles.min.css`,
  ], // ビルド生成ファイルのみ削除（ライブラリのCSSは除外）
  cssMap: `${distBase}/css/**/*.css.map`,
  img: `${distBase}/images/**/*`,
  html: `${distBase}/**/*.html`,
  js: [
    `${distBase}/js/**/*.js`,
    `!${distBase}/js/**/*.min.js`, // すべてのminファイルは除外
  ],
  jsMinGenerated: [
    `${distBase}/js/script.min.js`, // ビルドで生成されたminファイルのみ削除
  ], // ビルド生成ファイルのみ削除（ライブラリのJSは除外）
};

const clean = (done) => {
  del([...delPath.css, delPath.cssMap, delPath.img, delPath.html, ...delPath.js, ...delPath.jsMinGenerated], {
    force: true,
  });
  done();
};

// タスクのエクスポート
exports.sass = cssSass; // CSS生成（開発用：通常版のみ）
exports.css = series(cssSass, cssCopy); // CSS生成（開発用：通常版のみ）
exports.img = imgImagemin;
exports.js = series(jsBuild, jsCopy); // JS生成（開発用：通常版のみ）
exports.html = htmlCopy;
exports.clean = clean;
// HTMLファイルをコピー（本番用：置換なし）
const htmlCopyProduction = () => {
  return htmlCopy(true); // 引数で本番モードを指定
};

// ビルドタスク（通常版+圧縮版を生成、本番用HTML）
exports.build = series(
  clean,
  parallel(
    imgImagemin,
    series(cssSass, cssMinify), // CSS通常版+圧縮版
    series(jsBuild, jsMinify), // JS通常版+圧縮版
    htmlCopyProduction // 本番用HTML（.min.css/.min.jsのまま）
  ),
  parallel(cssCopy, jsCopy) // ライブラリファイルをコピー
);

// デフォルトタスク（開発用：通常版のみ）
exports.default = series(
  clean,
  parallel(imgImagemin, cssSass, jsBuild, htmlCopy), // 通常版のみ
  parallel(cssCopy, jsCopy), // ライブラリファイルをコピー
  parallel(watchFiles, browserSyncFunc)
);
