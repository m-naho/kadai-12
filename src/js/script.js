console.log($(".js-swiper"));

window.addEventListener("DOMContentLoaded", () => {
  jQuery(function ($) {
    // ページトップボタン
    var topBtn = $(".js-pagetop");
    topBtn.hide();

    // ページトップボタンの表示設定
    $(window).scroll(function () {
      if ($(this).scrollTop() > 70) {
        // 指定px以上のスクロールでボタンを表示
        topBtn.fadeIn();
      } else {
        // 画面が指定pxより上ならボタンを非表示
        topBtn.fadeOut();
      }
    });

    // ページトップボタンをクリックしたらスクロールして上に戻る
    topBtn.click(function () {
      $("body,html").animate(
        {
          scrollTop: 0,
        },
        300,
        "swing",
      );
      return false;
    });

    // スムーススクロール (絶対パスのリンク先が現在のページであった場合でも作動。ヘッダーの高さ考慮。)
    $(document).on("click", 'a[href*="#"]', function () {
      let time = 400;
      let header = $("header").innerHeight();
      let target = $(this.hash);
      if (!target.length) return;
      let targetY = target.offset().top - header;
      $("html,body").animate({ scrollTop: targetY }, time, "swing");
      return false;
    });

    // ハンバーガーメニュー開閉
    $(".js-hamburger").click(function () {
      $(this).toggleClass("is-open");
      $(".js-drawer").toggleClass("is-open");
      $("body").toggleClass("is-fixed");
    });

    // ドロワーメニュー内のリンクがクリックされたら閉じる
    $(".js-drawer a").click(function () {
      $(".js-hamburger").removeClass("is-open");
      $(".js-drawer").removeClass("is-open");
      $("body").removeClass("is-fixed");
    });

    if ($(".js-swiper").length > 0) {
      // 修正ポイント：$(".js-swiper") ではなく ".js-swiper" (文字列) を渡す
      const swiper = new Swiper(".js-swiper", {
        loop: true,
        speed: 6000, 
        allowTouchMove: false,
        slidesPerView: 1.8, 
        spaceBetween: 20,
        autoplay: {
          delay: 0,
          disableOnInteraction: false,
          easing: "linear",
        },
        breakpoints: {
          490: {
            slidesPerView: 2.5,
          },
          630: {
            slidesPerView: 2.9,
          },
          768: {
            slidesPerView: 4.8,
          },
        },
      });
    }
  });
});
