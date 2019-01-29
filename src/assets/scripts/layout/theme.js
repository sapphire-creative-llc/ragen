import "../../styles/theme.scss";
import "../../styles/theme.scss.liquid";
import "../../styles/fonts.scss.liquid";

import jsonp from "jsonp";

($ => {
  const $body = $("body");
  const $siteNav = $(".site-nav");
  const $mobileNav = $(".mobile-nav");
  const $mobileNavLink = $(".mobile-nav a");
  const $cart = $(".cart-items");
  const $trigger = $(".js-cart-trigger");
  const $headerCount = $(".js-header-count");
  const $sidebarCount = $(".js-sidebar-count");
  const $cartSubtotal = $(".js-subtotal");
  const $cartSubtotalCost = $(".js-subtotal-cost");
  const $cartShipping = $(".js-shipping");
  const $cartShippingName = $(".js-shipping-name");
  const $cartShippingCost = $(".js-shipping-cost");
  const $cartForm = $(".js-cart-form");
  const $cartError = $(".js-cart-error");
  const $mobileNavOpen = $(".js-mobile-nav-open");
  const $mobileNavClose = $(".js-mobile-nav-close");
  const $productDetails = $(".product-details");
  const $productWrapper = $(".js-product-wrapper");
  const $detailsTab = $(".js-details-tab");
  const $mobileHeader = $(".js-header.hide-md");
  const $desktopHeader = $(".js-header.show-md");
  const $footer = $(".js-footer");
  const $productTabs = $(".product-tabs");
  const $productTab = $(".product-tab");
  const $viewCart = $(".js-view-cart");
  const $shopCollection = $(".js-shop-collection");
  const $addToCartError = $(".add-to-cart-error");

  const breakpoint = () => {
    return window.getComputedStyle(document.querySelector("body"), ":before")
      .content;
  };

  $trigger.on("click", e => {
    e.preventDefault();

    const openCart = () => {
      const bp = breakpoint()
        .replace(/"/g, " ")
        .trim();

      if (bp === "sm") {
        $body.addClass("overflow-hidden");
      }

      $body.addClass("cart-open");
    };

    const closeCart = () => {
      $body.removeClass("cart-open overflow-hidden");
    };

    $body.hasClass("cart-open") ? closeCart() : openCart();
  });

  const priceToCurrency = price => {
    return `$${price / 100}`;
  };

  $(document).on("click", "button.decrement-cart-quantity", e => {
    const $input = $(e.currentTarget).siblings("input");
    const val = parseFloat($input.val());

    if (val > 1) {
      $input.val(val - 1).change();
    }
  });

  $(document).on("click", "button.increment-cart-quantity", e => {
    const $input = $(e.currentTarget).siblings("input");
    const val = parseFloat($input.val());

    $input.val(val + 1).change();
  });

  const cartItemToHtml = item => {
    const {
      image,
      variant_id,
      variant_title,
      product_title,
      product_type,
      quantity,
      price
    } = item;
    const formattedPrice = priceToCurrency(price);
    const variantTitle = variant_title || "";

    return `
      <div class="cart-item w100p" data-id="${variant_id}">
        <div class="flex w100p">
          <div class="cart-image bg-center bg-cover" style="background-image: url(${image})"></div>
          <div class="flex-1 px1">
            <p class="m0 h4">${product_title}</p>
            <p class="m0 h5">${variantTitle} ${product_type} - ${formattedPrice}</p>
            <div class="number-input inline-block rounded border border-charcoal">
              <button class="decrement-cart-quantity" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" viewBox="0 0 9 6" fill="#979797">
                  <path d="M4.6 3.8L7.8 0.6 8.6 1.5 5.5 4.7 5.5 4.7 4.6 5.6 0.5 1.4 1.4 0.5 4.6 3.8Z"/>
                </svg>
              </button>
              <input class="text-center white" min="1" name="quantity" value="${quantity}" type="number">
              <button class="increment-cart-quantity plus" type="button">
                <svg style="transform: rotate(180deg);" xmlns="http://www.w3.org/2000/svg" width="13" viewBox="0 0 9 6" fill="#979797">
                  <path d="M4.6 3.8L7.8 0.6 8.6 1.5 5.5 4.7 5.5 4.7 4.6 5.6 0.5 1.4 1.4 0.5 4.6 3.8Z"/>
                </svg>
              </button>
            </div>
          </div>
          <div>
            <a class="h5 no-underline rounded border border-charcoal block remove-from-cart hover-opacity-5" href="#">
              <svg class="pointer medium-gray block" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 15 15">
                <polygon points="7.5 8.5 1 14.9 0 13.9 6.5 7.5 0 1 1 0 7.5 6.5 14 0 15 1 8.5 7.5 15 14 14 15" fill="currentColor"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    `;
  };

  const findItemId = $el => {
    return $el.closest(".cart-item").data("id");
  };

  const findItemById = id => {
    return $cart.find(`.cart-item[data-id='${id}']`);
  };

  const calculateCartCount = items => {
    return items.reduce((acc, { quantity }) => acc + quantity, 0);
  };

  const getShippingRates = () => {
    const z = "shipping_address%5Bzip%5D=67226";
    const c = "shipping_address%5Bcountry%5D=US";
    const p = "shipping_address%5Bprovince%5D=Kansas";

    return $.getJSON(`/cart/shipping_rates.json?${z}&${c}&${p}`);
  };

  const getCartItems = () => {
    return $.getJSON("/cart.js");
  };

  const createCartItem = data => {
    return $.post("/cart/add.js", data);
  };

  const updateCartItem = (id, amount) => {
    return $.post("/cart/update.js", { updates: { [id]: amount } });
  };

  const deleteCartItem = id => {
    return $.post("/cart/update.js", { updates: { [id]: 0 } });
  };

  const updateItemsUI = items => {
    $cart.html(items.map(cartItemToHtml).join("\n"));
  };

  const getProductData = () => {
    return $.getJSON(`${window.location.href}.json`);
  };

  const appendCartItem = (item, id) => {
    $("<div/>")
      .addClass("append-cart-item")
      .appendTo(".cart-items")
      .html(cartItemToHtml(item))
      .delay(250);

    setTimeout(() => {
      $(".append-cart-item").addClass("slide");
      updateCart(false);
    }, 300);
  };

  const updateCountUI = count => {
    if (count > 0) {
      $viewCart.show();
      $shopCollection.hide();
      $headerCount.show().text(count);
      $sidebarCount.text(
        `${count} ${count === 1 ? "Item in Cart" : "Items in Cart"}`
      );
    } else {
      $viewCart.hide();
      $shopCollection.show();
      $headerCount.hide();
      $sidebarCount.text("0 Items in Cart");
    }
  };

  const updateTotalUI = total => {
    if (total === 0) {
      $cartSubtotal.hide();
      $cartShipping.hide();
    } else {
      $cartSubtotal.show();
      $cartShipping.show();
      $cartSubtotalCost.text(priceToCurrency(total));
    }
  };

  const updateShippingUI = (name, price, total) => {
    $cartShippingName.text(name);
    $cartShippingCost.text(priceToCurrency(price * 100));
    $cartSubtotalCost.text(priceToCurrency(total + price * 100));
  };

  const updateCart = (reorderItems = true) => {
    getCartItems().done(({ items, total_price }) => {
      if (reorderItems) {
        updateItemsUI(items);
      }

      updateTotalUI(total_price);
      updateCountUI(calculateCartCount(items));

      getShippingRates()
        .done(({ shipping_rates }) => {
          const { name: shippingName, price: shippingPrice } = shipping_rates
            ? shipping_rates[0]
            : {};

          updateShippingUI(shippingName, shippingPrice, total_price);
        })
        .fail(() => {
          updateTotalUI(0);
        });
    });
  };

  const deleteItem = e => {
    e.preventDefault();

    const id = findItemId($(e.currentTarget));
    deleteCartItem(id).done(() => {
      findItemById(id).hide();
      updateCart();
    });
  };

  const updateQuantity = e => {
    const id = findItemId($(e.currentTarget));
    updateCartItem(id, e.target.value).done(updateCart);
  };

  const hideError = () => {
    $cartError.hide();
  };

  const showError = description => {
    $cartError.show().text(description);
  };

  $cart.on("click", ".remove-from-cart", e => deleteItem(e));
  $cart.on("change", "input[name='quantity']", e => updateQuantity(e));

  $cartForm.on("submit", e => {
    e.preventDefault();

    $body.addClass("cart-open");

    const $form = $(e.currentTarget);
    const serializedData = $form.serialize();
    const serializedJSON = $form.serializeArray();

    const id = serializedJSON[0].value;
    const alreadyInCart = findItemById(id).length === 1;

    if (!alreadyInCart) {
      createCartItem(serializedData)
        .done(response => {
          hideError();
          const item = JSON.parse(response);
          appendCartItem(item, id);
        })
        .fail(({ responseText }) => {
          const { description } = JSON.parse(responseText);
          setTimeout(() => showError(description), 250);
        });
    }
  });

  $("input[data-position='1'], input[data-position='2']").on("change", e => {
    const $this = $(e.currentTarget);
    const position = $this.data("position");
    const one = $this
      .closest("form")
      .find("input[data-position='1']:checked")
      .val();
    const two = $this
      .closest("form")
      .find("input[data-position='2']:checked")
      .val();

    getProductData().then(({ product }) => {
      $.getJSON(`/products/${product.handle}.js`).then(({ variants }) => {
        const selectedVariant = variants.filter(v => {
          return v.option2
            ? v.option1 === one && v.option2 === two
            : v.option1 === one;
        });

        if (selectedVariant.length > 0) {
          $('select[name="id"]')
            .val(selectedVariant[0].id)
            .change();
        }

        disableUnavailableVariants(variants);
      });
    });
    console.log("here", $this);
    $this
      .closest("label")
      .find("button")
      .removeClass("black border-black");

    $this.siblings().addClass("black border-black");
  });

  const disableUnavailableVariants = variants => {
    const selectedOption1 = $("form")
      .find("input[data-position='1']:checked")
      .val();

    const selectedOption2 = $("form")
      .find("input[data-position='2']:checked")
      .val();

    $(`input[data-option-value]`)
      .prop("disabled", false)
      .css("cursor", "pointer")
      .siblings("button")
      .find("span")
      .removeClass("strike");

    variants.filter(v => v.option1 === selectedOption1).map(v => {
      if (!v.available) {
        $(`input[data-option-value='${v.option2}']`)
          .prop("disabled", true)
          .css("cursor", "default")
          .siblings("button")
          .find("span")
          .addClass("strike");
      }
    });

    variants.filter(v => v.option2 === selectedOption2).map(v => {
      if (!v.available) {
        $(`input[data-option-value='${v.option1}']`)
          .prop("disabled", true)
          .css("cursor", "default")
          .siblings("button")
          .find("span")
          .addClass("strike");
      }
    });
  };

  getProductData().then(({ product }) => {
    $.getJSON(`/products/${product.handle}.js`).then(({ variants }) => {
      /**
       * Set the first available variant on load
       */
      const firstAvailableVariant = variants.filter(v => v.available)[0];

      $('select[name="id"]')
        .val(firstAvailableVariant.id)
        .change();

      $(`input[data-option-value='${firstAvailableVariant.option1}']`)
        .siblings()
        .addClass("black border-black");

      $(`input[data-option-value='${firstAvailableVariant.option2}']`)
        .siblings()
        .addClass("black border-black");

      disableUnavailableVariants(variants);
    });
  });

  $('select[name="id"]').hide();

  // Reset generated content margin
  $(".page")
    .find("p")
    .last()
    .addClass("m0");

  $(".page")
    .find("h5")
    .addClass("heading");

  $mobileNavOpen.on("click", e => {
    $body.addClass("overflow-hidden");
    $mobileNav.addClass("open");
  });

  $mobileNavClose.on("click", e => {
    $body.removeClass("overflow-hidden");
    $mobileNav.removeClass("open");
  });

  $mobileNavLink.on("click", e => {
    $body.removeClass("overflow-hidden");
    $mobileNav.removeClass("open");
  });

  const positionProductDetails = () => {
    const isOverflowing =
      $productDetails.outerHeight() + $desktopHeader.height() >
      $(window).height();

    if (isOverflowing) {
      $productDetails.removeClass("sticky");
    } else {
      $productDetails.addClass("sticky");
    }
  };

  const setProductImagesHeight = () => {
    $productWrapper.css("height", $(".product-images").height());
  };

  $(".js-close-announcement").on("click", e => {
    e.preventDefault();

    $(".js-announcement").addClass("hide");
    localStorage.setItem("showAnnouncement", "false");
  });

  if (localStorage.showAnnouncement === "false") {
    $(".js-announcement").addClass("hide");
  }

  $(".js-close-popup").on("click", e => {
    e.preventDefault();

    $(".js-popup").addClass("hidden");
    $body.removeClass("overflow-hidden");
    localStorage.setItem("showPopup", "false");
  });

  if (localStorage.showPopup !== "false") {
    setTimeout(() => {
      $(".js-popup.newsletter-popup").removeClass("hidden");
    }, 7500);
  }

  $(".sizing-chart-trigger").on("click", e => {
    e.preventDefault();
    $(".js-popup.sizing-chart-popup").removeClass("hidden");
  });

  $(".thumbnail").on("click", e => {
    e.preventDefault();
    const id = $(e.currentTarget).data("id");
    const offset = $(`#${id}`).offset().top - 135;

    $("html, body").animate({ scrollTop: offset }, 300);
  });

  const fadeInImage = () => {
    $("div[data-img]").each(function() {
      if (!$(this).hasClass("fade-image")) {
        return;
      }

      const $this = $(this);
      const $window = $(window);
      const fadeInPoint = $window.scrollTop() + $window.height() - 100;
      const imageOffset = $this.offset().top;
      const imageHref = $this.data("img");

      if (fadeInPoint > imageOffset) {
        $("<img>")
          .attr("src", imageHref)
          .on("load", () => {
            $this
              .css("background-image", `url(${imageHref})`)
              .removeClass("fade-image");
          });
      }
    });
  };

  $(".secondary-trigger").on("click", () => {
    $(".secondary-nav").toggleClass("hide");
  });

  $(".mc-form-footer, .mc-form-popup").on("submit", function(e) {
    e.preventDefault();
    const form = $(this).serialize();
    $("svg.loading").show();
    $(this)
      .find('input[type="submit"]')
      .hide();

    jsonp(
      `//ragenjewels.us13.list-manage.com/subscribe/post-json?u=d69b64f1a08553838add1bcfc&id=c207b39bd8&${form}`,
      { param: "c" },
      (err, data) => {
        if (data.result === "success") {
          $(this)
            .find('input[type="email"]')
            .val("");
          $(this)
            .find(".success")
            .text(data.msg)
            .removeClass("hide");
          $("svg.loading").hide();
          $(this)
            .find('input[type="submit"]')
            .show();
          setTimeout(() => {
            $(this)
              .find(".success")
              .text("");
          }, 3000);
        }
      }
    );
  });

  const token = "391279626.1677ed0.e912fb31c7d341b49212c5ff36347dfa";

  let instagrams = [];

  const renderPhoto = photo => {
    instagrams.push(photo);

    $(".ig-photos").append(`
      <div class="image-wrapper mb1 pointer hover-opacity-5">
        <div class="ig-photo image bg-center bg-cover fade-image rounded" style="padding-top: 100%;" data-id="${
          photo.id
        }" data-img="${photo.image}"></div>
      </div>
    `);
  };

  $.ajax({
    url: `https://api.instagram.com/v1/users/self/media/recent/?access_token=${token}`,
    dataType: "jsonp",
    type: "GET",
    success: function(data) {
      data.data.filter((photo, i) => Boolean(i < 8)).map(photo => {
        $.ajax({
          url: `https://api.instagram.com/v1/media/${
            photo.id
          }/comments?access_token=${token}`,
          dataType: "jsonp",
          type: "GET",
          success: function(comments) {
            renderPhoto({
              id: photo.id,
              photoLink: photo.link,
              accountLink: `https://www.instagram.com/${photo.user.username}`,
              likesCount: photo.likes.count,
              commentsCount: photo.comments.count,
              username: photo.user.username,
              image: photo.images.standard_resolution.url,
              avatar: photo.user.profile_picture,
              caption: photo.caption.text,
              comments
            });
          }
        });
      });
    }
  });

  $(".ig-photos").on("click", ".ig-photo", e => {
    e.preventDefault();

    const pluralize = (count, noun, suffix = "s") =>
      `${count} ${noun}${count !== 1 ? suffix : ""}`;

    const photo = instagrams.find(ig => ig.id === e.target.dataset.id);
    console.log(photo);

    $body.addClass("overflow-hidden");
    $(".ig-popup").removeClass("hidden");
    $(".ig-img").attr("src", photo.image);
    $(".ig-avatar").css("background-image", `url(${photo.avatar})`);
    $(".ig-username").text(photo.username);
    $(".ig-likes-count").text(pluralize(photo.likesCount, "like"));
    $(".ig-comments-count").text(pluralize(photo.commentsCount, "comment"));
    $(".ig-photo-link").attr("href", photo.photoLink);
    $(".ig-account-link").attr("href", photo.accountLink);
    $(".ig-comments")
      .css({
        "overflow-y": "scroll",
        height: $(".ig-image").height() - 210
      })
      .append(
        photo.comments.data
          .map(comment => {
            return `<li class="h5"><span class="black apercu-medium">${
              comment.from.username
            }</span> <span class="dark-gray">${comment.text}</span></li>`;
          })
          .join("")
      );
  });

  $(window).on("scroll", () => {
    fadeInImage();
  });

  $(window).on("load", () => {
    updateCart();
    fadeInImage();

    if (breakpoint() === "sm") {
      return;
    }

    setProductImagesHeight();
    positionProductDetails();
  });

  $(window).on("resize", () => {
    if (breakpoint() === "sm") {
      return;
    }

    setProductImagesHeight();
    positionProductDetails();
  });
})(jQuery);
