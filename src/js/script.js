window.addEventListener("DOMContentLoaded", () => {
  jQuery(function ($) {
    // ページトップボタン
    var topBtn = $(".js-pagetop");
    topBtn.hide();

    // ページトップボタンの表示設定
    $(window).scroll(function () {
      if ($(this).scrollTop() > 70) {
        topBtn.fadeIn();
      } else {
        topBtn.fadeOut();
      }
    });

    // ページトップボタンをクリックしたらスクロールして上に戻る
    topBtn.click(function () {
      $("body,html").animate({ scrollTop: 0 }, 300, "swing");
      return false;
    });

    // スムーススクロール
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
          490: { slidesPerView: 2.5 },
          630: { slidesPerView: 2.9 },
          768: { slidesPerView: 4.5 },
        },
      });
    }
  });
  const fadeOption = {
    root: null,
    rootMargin: "0px 0px -10% 0px",
    threshold: 0,
  };

  function doWhenIntersect(entries, observer) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-intersecting");
        observer.unobserve(entry.target);
      }
    });
  }

  const fadeObserver = new IntersectionObserver(doWhenIntersect, fadeOption);

  document
    .querySelectorAll(".js-fade__item, .js-fade__left, .js-fade__right")
    .forEach((el) => {
      fadeObserver.observe(el);
    });

  const header = document.querySelector(".p-header");
  const fv = document.querySelector(".p-fv");
  const btnSquare = document.querySelector(".p-fv__reserve-square");
  const btnCircle = document.querySelector(".p-fv__reserve-circle");

  window.addEventListener("scroll", () => {
    const fv = document.querySelector(".p-fv");
    const fvHeight = fv.offsetHeight;

    const changePoint = fvHeight + 100;

    if (window.scrollY > changePoint) {
      header.classList.add("is-color-change");
      btnSquare.classList.add("is-hidden");
      btnCircle.classList.add("is-show");
    } else {
      header.classList.remove("is-color-change");
      btnSquare.classList.remove("is-hidden");
      btnCircle.classList.remove("is-show");
    }
  });
});
