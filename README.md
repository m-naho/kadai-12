# flocss_SPtoPC_2025

静的サイト制作のためのGulp開発環境です。
FLOCSS設計、スマホファースト、自動リロードなど開発環境を提供します。

## 動作環境
- **Node.js**: v14.0.0 以上（推奨: v16〜18以上）
- **Gulp**: 4系

## セットアップ

```bash
# 1. プロジェクトフォルダに移動
cd gulp

# 2. パッケージをインストール
npm install

# 3. 開発サーバーを起動（ファイル監視 + 自動リロード）
npm start
# または
npx gulp

# 開発用: 通常版（.js, .css）のみ生成
# HTML内は自動で .min.css → .css、.min.js → .js に置換
```

## 使用可能なコマンド

```bash
# 開発モード（通常版のみ生成）
npm start          # ファイル監視 + BrowserSync
                   # - styles.css のみ生成（.min.cssなし）
                   # - script.js のみ生成（.min.jsなし）
                   # - HTMLは .css/.js に自動置換

# 本番ビルド（通常版 + 圧縮版を生成）
npm run build      # - styles.css + styles.min.css を生成
                   # - script.js + script.min.js を生成
                   # - HTMLは .min.css/.min.js のまま

# その他
npm run clean      # dist フォルダをクリーン

# 個別タスク
npx gulp sass      # Sassのみコンパイル
npx gulp img       # 画像のみ最適化
npx gulp js        # JavaScriptのみ処理
npx gulp html      # HTMLのみコピー
```

## ディレクトリ構成

```
project/
├── src/                      # 開発用ソースファイル
│   ├── sass/                 # Sassファイル（FLOCSS設計）
│   ├── css/                  # ライブラリ用CSSファイル（.min.css）
│   ├── js/                   # JavaScriptファイル
│   │   ├── script.js         # カスタムJS
│   │   └── *.min.js          # ライブラリJS（swiper等）
│   ├── images/               # 画像ファイル
│   └── index.html            # HTMLファイル（.min.css/.min.jsを記述）
├── dist/                     # 出力先（納品用）
│   ├── css/
│   │   ├── styles.css        # 開発用CSS
│   │   ├── styles.css.map    # ソースマップ
│   │   ├── styles.min.css    # 本番用CSS（ビルド時のみ生成）
│   │   └── *.min.css         # ライブラリCSS
│   ├── js/
│   │   ├── script.js         # 開発用JS
│   │   ├── script.min.js     # 本番用JS（ビルド時のみ生成）
│   │   └── *.min.js          # ライブラリJS
│   ├── images/               # 最適化済み画像（WebP含む）
│   └── index.html            # 開発時は.css/.js、ビルド時は.min版
└── gulp/                     # Gulp設定
    ├── gulpfile.js           # タスク定義（rem→pxフォールバック設定含む）
    ├── package.json          # 依存関係
    └── node_modules/         # パッケージ
```

## 主な機能

### 📦 Sass/CSS
- ✅ **Dart Sass** 対応
- ✅ **CSS変数（カスタムプロパティ）** サポート
- ✅ **Autoprefixer** でベンダープレフィックス自動付与
- ✅ **CSSプロパティの自動整列**（アルファベット順）
- ✅ **rem→pxフォールバック機能**（IE対応時に有効化可能）
- ✅ 開発用（styles.css + sourcemap）と本番用（styles.min.css）を自動生成
- ✅ **FLOCSS設計** 採用
- ✅ **インデント2スペース**で自動整形
- ✅ CDNファイル（`.min.css`や`src/css/`フォルダ）は整形処理をスキップ

### 🖼️ 画像最適化
- ✅ JPEG/PNG/SVG を自動圧縮
- ✅ **WebP形式** に自動変換

### 📝 JavaScript
- ✅ 圧縮版（.min.js）を自動生成
- ✅ エラー時も処理を継続
- ✅ **インデント2スペース**で自動整形
- ✅ CDNファイル（`.min.js`や`vendor/`フォルダ）は整形処理をスキップ

### 📄 HTML
- ✅ src/ から dist/ へ自動コピー
- ✅ ファイル変更を自動検知してブラウザリロード
- ✅ **インデント2スペース**で自動整形

### 🚀 開発サーバー
- ✅ **BrowserSync** による自動リロード
- ✅ ファイル変更を自動検知

## CSS設計（FLOCSS）

```
sass/
├── foundation/      # リセットCSS、変数定義
├── layout/          # レイアウト（l-）
├── object/
│   ├── component/   # 再利用可能なコンポーネント（c-）
│   ├── project/     # プロジェクト固有のパターン（p-）
│   └── utility/     # ユーティリティクラス（u-）
└── styles.scss      # メインファイル
```

<!-- ## CSS変数の使い方 -->

<!-- ```scss
// _variable.scss で定義
:root {
  --font-main: "Noto Sans JP", sans-serif;
  --c-main: #333;
  --white: #fff;
}

// _setting.scss でSass変数として参照可能
$font-main: var(--font-main);
$black: var(--c-main);
``` -->

## rem→pxフォールバック機能

IE11などの古いブラウザ対応が必要な場合に、rem値の前にpxフォールバックを自動追加できます。
ピクセルパーフェクトにも使いやすいです。

### 設定方法

`gulp/gulpfile.js` の54行目で切り替えます：

```javascript
//★ rem→pxフォールバック設定
// true: フォールバックあり（px + rem）、false: フォールバックなし（remのみ）
const REM_FALLBACK_ENABLED = true; // ← ここをtrue/falseで切り替え
```

### 出力例

**`true`の場合（フォールバックあり）**
```css
.example {
  font-size: 20px;      /* pxフォールバック（IE11対応） */
  font-size: 1.25rem;   /* モダンブラウザ用 */
  margin: 32px;         /* pxフォールバック */
  margin: 2rem;         /* モダンブラウザ用 */
}
```

**`false`の場合（フォールバックなし）**
```css
.example {
  font-size: 1.25rem;   /* remのみ */
  margin: 2rem;         /* remのみ */
}
```

### 使用シーン

1. **開発中**: `true`に設定してIE11対応のCSSを確認
2. **モダンブラウザのみ対応**: `false`に設定（デフォルト推奨）
3. **納品前**: クライアント要件に応じて設定を確認 →`false`に設定（デフォルト推奨）

### 開発フロー

```bash
# 1. フォールバック設定を変更
# gulpfile.jsの54行目を編集

# 2. Gulpでビルド
cd gulp
npx gulp

# 3. 出力されたCSSを確認
# dist/css/styles.css を確認
```

### 注意事項

⚠️ **開発終了時の確認**
- クライアント要件に応じて`true`/`false`を設定
- 設定変更後は必ず`npm run build`で本番ビルドを実行
- `dist/`フォルダの内容を納品前に確認

## 出力ファイル

### 開発時（`npm start` または `npx gulp`）
**CSS**
- `styles.css` - 通常版のみ（読みやすい形式）
- `styles.css.map` - ソースマップ（デバッグ用）
- ライブラリ `.min.css` - そのままコピー

**JavaScript**
- `script.js` - 通常版のみ
- ライブラリ `.min.js` - そのままコピー

**HTML**
- `.min.css` → `.css` に自動置換
- `.min.js` → `.js` に自動置換

### ビルド時（`npm run build`）
**CSS**
- `styles.css` - 通常版
- `styles.min.css` - 圧縮版（本番用）
- `styles.css.map` - ソースマップ
- ライブラリ `.min.css` - そのままコピー

**JavaScript**
- `script.js` - 通常版
- `script.min.js` - 圧縮版（本番用）
- ライブラリ `.min.js` - そのままコピー

**HTML**
- `.min.css` / `.min.js` のまま（本番用）

**画像**
- 元の形式（JPEG/PNG/SVG）で圧縮
- WebP形式も同時生成

## 開発フロー

### 1. 開発開始

```bash
cd gulp
npm start  # または npx gulp
```

### 2. ファイル編集（src/）

HTMLを含むすべてのファイルは `src/` フォルダで編集します：
- **HTML**: `src/index.html` を編集（`.min.css`/`.min.js`を記述）
- **Sass**: `src/sass/` 内のファイルを編集
- **JavaScript**: `src/js/script.js` を編集
- **画像**: `src/images/` に配置
- **ライブラリ**: `src/js/` に `.min.js`、`src/css/` に `.min.css` を配置

### 3. 自動コンパイル（dist/）

Gulpが自動的に以下を生成します：
- **開発時**: 通常版（`.js` / `.css`）のみ
- **ビルド時**: 通常版 + 圧縮版（`.min.js` / `.min.css`）

### 4. 納品前の作業

```bash
# 1. rem→pxフォールバック設定を確認
# gulpfile.jsの54行目: REM_FALLBACK_ENABLED を true/false で設定

# 2. 本番ビルドを実行
npm run build

# 3. dist/フォルダの内容を確認
# - styles.min.css が生成されているか
# - script.min.js が生成されているか
# - index.html が .min.css/.min.js を読み込んでいるか
```

## ライブラリの追加方法

### ✅ 推奨：すべてのファイルは `src` に配置

**❌ `dist` に直接入れないでください**
- `gulp clean` で削除される可能性があります
- Gitで管理できません

### 📦 ライブラリファイルの配置ルール

#### JavaScript ライブラリ
**`.min.js` ファイルを `src/js/` 直下に配置**

```bash
# 例：Swiperライブラリ
src/js/swiper-bundle.min.js  → dist/js/swiper-bundle.min.js（そのままコピー）
src/js/jquery.min.js         → dist/js/jquery.min.js（そのままコピー）
```

#### CSS ライブラリ
**`.min.css` ファイルを `src/css/` に配置**

```bash
# 例：Swiperライブラリ
src/css/swiper-bundle.min.css  → dist/css/swiper-bundle.min.css（そのままコピー）
src/css/aos.min.css            → dist/css/aos.min.css（そのままコピー）
```

### 📝 使用例

```bash
src/
├── js/
│   ├── script.js              # カスタムJS（開発用）
│   ├── swiper-bundle.min.js   # ライブラリ
│   └── jquery.min.js          # ライブラリ
├── css/
│   └── swiper-bundle.min.css  # ライブラリ
└── sass/                      # カスタムCSS（開発用）
    └── styles.scss
```

### ⚙️ 自動処理の仕組み

- **カスタムファイル**（`script.js`, `styles.scss`）: インデント2スペースで自動整形
- **ライブラリ**（`.min.js` / `.min.css`）: そのままコピー（整形処理なし）
- **ビルド時のみ**: カスタムファイルの圧縮版（`.min.js` / `.min.css`）を生成

## クライアント納品時

### 本番環境用ファイル（必須）
`dist/` フォルダ全体を納品します：
```
dist/
├── css/
│   └── styles.min.css           # 本番用CSS（圧縮版）
├── js/
│   └── *.min.js                 # 本番用JS（圧縮版）
├── images/                      # 最適化済み画像
└── index.html                   # HTMLファイル
```

### 開発用ファイル（任意）
クライアントが今後も編集する可能性がある場合は、以下も含める：
- `src/` フォルダ全体（HTML、Sass、JS、画像のソースファイル）
- `gulp/` フォルダ全体（ビルド設定）
- `styles.css` + `styles.css.map` - ソースマップ付きCSS（デバッグ用）
- `*.js`（非圧縮版） - 読みやすいJavaScript

### 納品不要なファイル
本番環境のみの場合は、以下は不要です：
- `src/` フォルダ全体（Sassソースファイル）
- `gulp/` フォルダ全体（ビルド設定）
- `.map` ファイル（本番環境では不要）

## 備考
- **CSS設計**: [FLOCSS](https://github.com/hiloki/flocss)
- **スマホファースト設計**
- **rem単位推奨**（1rem = 16px）
- **対応ブラウザ**: モダンブラウザ推奨（IE11対応はrem→pxフォールバック機能を有効化）