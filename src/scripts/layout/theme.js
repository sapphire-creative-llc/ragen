import '../../styles/theme.scss';
import '../../styles/theme.scss.liquid';
import '../../styles/fonts.scss.liquid';

import subscribe from 'klaviyo-subscribe';
import Siema from 'siema';

($ => {
  const $body = $('body');
  const $siteNav = $('.site-nav');
  const $mobileNav = $('.mobile-nav');
  const $mobileNavLink = $('.mobile-nav a:not(.category-item)');
  const $cart = $('.cart-items');
  const $trigger = $('.js-cart-trigger');
  const $headerCount = $('.js-header-count');
  const $sidebarCount = $('.js-sidebar-count');
  const $checkout = $('.js-checkout');
  const $cartTotals = $('.js-cart-totals');
  const $cartSubtotal = $('.js-subtotal');
  const $cartSubtotalCost = $('.js-subtotal-cost');
  const $cartForm = $('.js-cart-form');
  const $mobileNavOpen = $('.js-mobile-nav-open');
  const $mobileNavClose = $('.js-mobile-nav-close');
  const $productDetails = $('.product-details');
  const $productWrapper = $('.js-product-wrapper');
  const $detailsTab = $('.js-details-tab');
  const $mobileHeader = $('.js-header.hide-md');
  const $desktopHeader = $('.js-header.show-md');
  const $footer = $('.js-footer');
  const $productTabs = $('.product-tabs');
  const $productTab = $('.product-tab');
  const $viewCart = $('.js-view-cart');
  const $shopCollection = $('.js-shop-collection');
  const $addToCartError = $('.add-to-cart-error');

  const checkout = $checkout.attr('href');
  const disableCheckout = () => {
    $checkout.addClass('loading');
    $checkout.removeAttr('href');
  };

  const enableCheckout = () => {
    $checkout.removeClass('loading');
    $checkout.attr('href', checkout);
  };

  let breakpoint;
  let setBreakpoint = () => {
    const bp = window.getComputedStyle(
      document.querySelector('body'),
      ':before'
    ).content;

    breakpoint = bp.replace(/"/g, ' ').trim();

    if (breakpoint === 'sm' || breakpoint === 'md') {
      $('.desktop-customizer').remove();
    } else {
      $('.mobile-customizer').remove();
    }
  };

  setBreakpoint();

  $trigger.on('click', e => {
    e.preventDefault();

    const openCart = () => {
      $body.addClass('overflow-hidden');
      $body.addClass('cart-open');
    };

    const closeCart = () => {
      $body.removeClass('cart-open overflow-hidden');
    };

    $body.hasClass('cart-open') ? closeCart() : openCart();
  });

  const priceToCurrency = price => {
    const cost = price / 100;
    return `$${cost.toFixed(2)}`;
  };

  $(document).on('click', 'button.decrement-cart-quantity', e => {
    const $input = $(e.currentTarget).siblings('input');
    const val = parseFloat($input.val());

    if (val > 1) {
      $input.val(val - 1).change();
    }
  });

  $(document).on('click', 'button.increment-cart-quantity', e => {
    const $input = $(e.currentTarget).siblings('input');
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
    const variantTitle = variant_title || '';

    return `
      <div class="cart-item w100p mb1" data-id="${variant_id}">
        <div class="flex w100p">
          <div class="cart-image bg-center bg-cover shrink-0" style="background-image: url(${image})"></div>
          <div class="flex-1 px1">
            <p class="m0 h4">${product_title}</p>
            <span class="block m0 h6 medium-gray">
              ${item.options_with_values.map(
                o => `<span>${o.name}: ${o.value}</span>`
              )}
            </span>
            ${
              item.line_level_discount_allocations.length > 0
                ? `<span class="pink h6 block">${priceToCurrency(
                    price - item.line_level_discount_allocations[0].amount
                  )}<strike class="strike medium-gray h6">${formattedPrice}</strike></span>`
                : `<p class="m0 h6 medium-gray">${formattedPrice}</p>`
            }
            <div class="number-input inline-block rounded border border-charcoal">
              <div class="flex items-center">
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
          </div>
          <div>
            <a class="js-remove-from-cart h5 no-underline rounded block hover-opacity-5" href="#">
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
    return $el.closest('.cart-item').data('id');
  };

  const findItemById = id => {
    return $cart.find(`.cart-item[data-id='${id}']`);
  };

  const calculateCartCount = items => {
    return items.reduce((acc, { quantity }) => acc + quantity, 0);
  };

  const getCartItems = () => {
    return $.getJSON('/cart.js');
  };

  const createCartItem = data => {
    return $.post('/cart/add.js', data);
  };

  const updateCartItem = (id, amount) => {
    return $.post('/cart/update.js', { updates: { [id]: amount } });
  };

  const deleteCartItem = id => {
    return $.post('/cart/update.js', { updates: { [id]: 0 } });
  };

  const updateItemsUI = items => {
    $cart.html(items.map(cartItemToHtml).join('\n'));
  };

  const getProductData = () => {
    return $.getJSON(`${window.location.href}.json`);
  };

  const appendCartItem = (item, id) => {
    $('.cart-items').append(cartItemToHtml(item));

    updateCart(false);
  };

  const updateCountUI = count => {
    $headerCount.show().text(count);
    if (count > 0) {
      $viewCart.show();
      $shopCollection.hide();
      $sidebarCount.text(
        `${count} ${count === 1 ? 'Item in Cart' : 'Items in Cart'}`
      );
    } else {
      $viewCart.hide();
      $shopCollection.show();
      $sidebarCount.text('0 Items in Cart');
    }
  };

  const updateTotalUI = total => {
    if (total === 0) {
      $cartTotals.hide();
    } else {
      $cartTotals.show();
      $cartSubtotalCost.text(priceToCurrency(total));
    }
  };

  const updateCart = (reorderItems = true) => {
    disableCheckout();

    getCartItems().done(({ items, total_price }) => {
      if (reorderItems) {
        updateItemsUI(items);
      }

      updateTotalUI(total_price);
      updateCountUI(calculateCartCount(items));
      enableCheckout();
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

  $cart.on('click', '.js-remove-from-cart', e => deleteItem(e));
  $cart.on('change', "input[name='quantity']", e => updateQuantity(e));

  $cartForm.on('submit', e => {
    e.preventDefault();
    disableCheckout();

    $body.addClass('cart-open');

    const $form = $(e.currentTarget);
    const serializedData = $form.serialize();
    const serializedJSON = $form.serializeArray();

    const id = serializedJSON[0].value;
    const alreadyInCart = findItemById(id).length === 1;

    if (alreadyInCart) {
      getCartItems().then(({ items }) => {
        const item = items.find(item => item.id === Number(id));
        updateCartItem(id, item.quantity + 1).then(updateCart);
      });
    } else {
      createCartItem(serializedData)
        .done(response => {
          const item = JSON.parse(response);
          appendCartItem(item, id);
          enableCheckout();
        })
        .fail(({ responseText }) => {
          enableCheckout();
          const { description } = JSON.parse(responseText);
          alert(decription);
        });
    }
  });

  $('.js-add-stack-to-bag').on('click', e => {
    e.preventDefault();

    $body.addClass('cart-open');
    disableCheckout();

    let variantIds = [];
    $('.customizer__right--slot-img').each(function() {
      variantIds.push($(this).data('id'));
    });

    createCartItem({ id: variantIds[0], quantity: 1 })
      .done(response => {
        const item1 = JSON.parse(response);
        createCartItem({ id: variantIds[1], quantity: 1 }).done(response => {
          const item2 = JSON.parse(response);
          createCartItem({ id: variantIds[2], quantity: 1 }).done(response => {
            const item3 = JSON.parse(response);

            appendCartItem(item1, variantIds[0]);
            appendCartItem(item2, variantIds[1]);
            appendCartItem(item3, variantIds[2]);

            setTimeout(updateCart, 50);

            enableCheckout();
          });
        });
      })
      .fail(({ responseText }) => {
        console.log('failed', response);
      });
  });

  $("input[data-position='1'], input[data-position='2']").on('change', e => {
    const $this = $(e.currentTarget);
    const position = $this.data('position');
    const one = $this
      .closest('form')
      .find("input[data-position='1']:checked")
      .val();
    const two = $this
      .closest('form')
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

    $this
      .closest('label')
      .find('button')
      .removeClass('black border-black');

    $this.siblings().addClass('black border-black');
  });

  const disableUnavailableVariants = variants => {
    const selectedOption1 = $('form')
      .find("input[data-position='1']:checked")
      .val();

    const selectedOption2 = $('form')
      .find("input[data-position='2']:checked")
      .val();

    $(`input[data-option-value]`)
      .prop('disabled', false)
      .css('cursor', 'pointer')
      .siblings('button')
      .find('span')
      .removeClass('strike');

    variants
      .filter(v => v.option1 === selectedOption1)
      .map(v => {
        if (!v.available) {
          $(`input[data-option-value='${v.option2}']`)
            .prop('disabled', true)
            .css('cursor', 'default')
            .siblings('button')
            .find('span')
            .addClass('strike');
        }
      });

    variants
      .filter(v => v.option2 === selectedOption2)
      .map(v => {
        if (!v.available) {
          $(`input[data-option-value='${v.option1}']`)
            .prop('disabled', true)
            .css('cursor', 'default')
            .siblings('button')
            .find('span')
            .addClass('strike');
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
        .addClass('black border-black');

      $(`input[data-option-value='${firstAvailableVariant.option2}']`)
        .siblings()
        .addClass('black border-black');

      disableUnavailableVariants(variants);
    });
  });

  $('select[name="id"]').hide();

  // Reset generated content margin
  $('.page')
    .find('p')
    .last()
    .addClass('m0');

  $('.page')
    .find('h5')
    .addClass('heading');

  $mobileNavOpen.on('click', e => {
    $body.addClass('overflow-hidden');
    $mobileNav.addClass('open');
  });

  $mobileNavClose.on('click', e => {
    $body.removeClass('overflow-hidden');
    $mobileNav.removeClass('open');
  });

  $mobileNavLink.on('click', e => {
    $body.removeClass('overflow-hidden');
    $mobileNav.removeClass('open');
  });

  const positionProductDetails = () => {
    const isOverflowing =
      $productDetails.outerHeight() + $desktopHeader.height() >
      $(window).height();

    if (isOverflowing) {
      $productDetails.removeClass('sticky');
    } else {
      $productDetails.addClass('sticky');
    }
  };

  const setProductImagesHeight = () => {
    $productWrapper.css('height', $('.product-images').height());
  };

  $('.js-close-announcement').on('click', e => {
    e.preventDefault();

    $('.js-announcement').addClass('hide');
    localStorage.setItem('showAnnouncement', 'false');
  });

  if (localStorage.showAnnouncement === 'false') {
    $('.js-announcement').addClass('hide');
  }

  $('.js-close-popup').on('click', e => {
    e.preventDefault();

    $('.js-popup').addClass('hidden');
    $body.removeClass('overflow-hidden');
    localStorage.setItem('showPopup', 'false');
  });

  if (localStorage.showPopup !== 'false') {
    setTimeout(() => {
      $('.js-popup.newsletter-popup').removeClass('hidden');
    }, 7500);
  }

  $('.sizing-chart-trigger').on('click', e => {
    e.preventDefault();
    $('.js-popup.sizing-chart-popup').removeClass('hidden');
  });

  $('.thumbnail').on('click', e => {
    e.preventDefault();
    const id = $(e.currentTarget).data('id');
    const offset = $(`#${id}`).offset().top - 135;

    $('html, body').animate({ scrollTop: offset }, 300);
  });

  const fadeInImage = () => {
    $('div[data-img]').each(function() {
      if (!$(this).hasClass('fade-image')) {
        return;
      }

      const $this = $(this);
      const $window = $(window);
      const fadeInPoint = $window.scrollTop() + $window.height();
      const imageOffset = $this.offset().top;
      const imageHref = $this.data('img');

      if (fadeInPoint > imageOffset) {
        $('<img>')
          .attr('src', imageHref)
          .on('load', () => {
            $this
              .css('background-image', `url(${imageHref})`)
              .removeClass('fade-image');
          });
      }
    });
  };

  $('.mc-form-footer, .mc-form-popup').on('submit', function(e) {
    e.preventDefault();
    const form = $(this).serialize();
    $('svg.loading').show();
    $(this)
      .find('button[type="submit"]')
      .hide();

    const email = $(this)
      .find('input[type="email"]')
      .val();

    subscribe('Lh2NxM', email).then(response => {
      if (response.success) {
        $(this)
          .find('input[type="email"]')
          .val('');
        $(this)
          .find('.success')
          .text('Thanks for subscribing!')
          .removeClass('hide');
        $('svg.loading').hide();
        $(this)
          .find('button[type="submit"]')
          .show();
        setTimeout(() => {
          $(this)
            .find('.success')
            .text('');
        }, 3000);
      }
    });
  });

  const base = 'https://api.instagram.com';
  const token = '391279626.1677ed0.99f88a45d4d54f568ba1b083bf218339';

  const renderInstagramPhotos = stringifiedPhotoData => {
    const photos = JSON.parse(stringifiedPhotoData);

    photos.map(photo => {
      const $wrapper = $('<div>', {
        class: 'image-wrapper mb1 pointer hover-opacity-5'
      });

      const $photo = $('<div>', {
        class: 'ig-photo image bg-center bg-cover fade-image rounded',
        style: 'padding-top: 100%;',
        'data-photo': JSON.stringify(photo),
        'data-img': photo.image
      });

      $('.ig-photos').append($wrapper.append($photo));
    });
  };

  const fetchInstagramPhotos = () => {
    const cachedKey = Object.keys(localStorage).find(k => /ragen-/.test(k));

    if (cachedKey) {
      const expireDate = cachedKey.split('ragen-')[1];

      if (Date.now() < expireDate) {
        renderInstagramPhotos(localStorage.getItem(cachedKey));
        return;
      }
    }

    new Promise((resolve, reject) => {
      return $.ajax({
        url: `${base}/v1/users/self/media/recent/?access_token=${token}`,
        dataType: 'jsonp',
        type: 'GET',
        success: function(data) {
          if (data.meta.error_message) {
            $('.static-insta').removeClass('hide');
            return reject();
          }

          const photos = data.data
            .filter((photo, i) => Boolean(i < 8))
            .map(photo => ({
              id: photo.id,
              photoLink: photo.link,
              accountLink: `${base}/${photo.user.username}`,
              likesCount: photo.likes.count,
              commentsCount: photo.comments.count,
              username: photo.user.username,
              image: photo.images.standard_resolution.url,
              avatar: photo.user.profile_picture,
              caption: photo.caption.text
            }));

          resolve(photos);
        },
        error: function(e) {
          reject(e);
        }
      });
    })
      .then(photos => {
        return Promise.all(
          photos.map(photo => {
            const { id } = photo;

            return new Promise((resolve, reject) => {
              $.ajax({
                url: `${base}/v1/media/${id}/comments?access_token=${token}`,
                dataType: 'jsonp',
                type: 'GET',
                success: function(comments) {
                  resolve({ ...photo, comments });
                }
              });
            });
          })
        );
      })
      .then(photos => {
        const stringified = JSON.stringify(photos);

        const date = new Date();
        const oneHourFromNow = date.setHours(date.getHours() + 1);

        localStorage.removeItem(cachedKey);
        localStorage.setItem(`ragen-${oneHourFromNow}`, stringified);
        renderInstagramPhotos(stringified);
      })
      .catch(e => {
        $('.static-insta').removeClass('hide');
      });
  };

  fetchInstagramPhotos();

  $('.ig-photos').on('click', '.ig-photo', e => {
    e.preventDefault();

    const pluralize = (count, noun, suffix = 's') =>
      `${count} ${noun}${count !== 1 ? suffix : ''}`;

    const photo = JSON.parse(e.target.dataset.photo);

    $body.addClass('overflow-hidden');
    $('.ig-popup').removeClass('hidden');
    $('.ig-img').attr('src', photo.image);
    $('.ig-avatar').css('background-image', `url(${photo.avatar})`);
    $('.ig-username').text(photo.username);
    $('.ig-likes-count').text(pluralize(photo.likesCount, 'like'));
    $('.ig-comments-count').text(pluralize(photo.commentsCount, 'comment'));
    $('.ig-photo-link').attr('href', photo.photoLink);
    $('.ig-account-link').attr('href', photo.accountLink);
    $('.ig-comments')
      .css({
        'overflow-y': 'scroll',
        height: $('.ig-image').height() - 210
      })
      .append(
        photo.comments.data
          .map(comment => {
            return `<li class="h6"><span class="black bold">${comment.from.username}</span> <span class="dark-gray">${comment.text}</span></li>`;
          })
          .join('')
      );
  });

  let stackProduct;
  let $stackProduct;
  let variantsStack = [];
  const defaultCustomizerCopy = $('.customizer__right--copy').html();

  const addVariantToStack = (variant, selectedOptions) => {
    variantsStack.push(variant);

    const $completed = $('.customizer__right--slot-img[style]');
    const $nextSlot = $('.customizer__right--slot-img:not([style])').first();

    $nextSlot
      .css('background-image', `url(${$stackProduct.data('img')})`)
      .data('id', variant.id);

    if (selectedOptions.length > 0) {
      const $nextOption = $('.customizer__right--slot-options:empty').first();
      selectedOptions.forEach(option => {
        $nextOption.append(
          `<span class="h6 block">${option.name}: ${option.value}</span>`
        );
      });
    }

    if ($completed.length === 2) {
      $('.customizer__button button').prop('disabled', false);

      const price = variantsStack.map(v => v.price).reduce((a, b) => a + b, 0);
      const discount = price - price * 0.4;

      $('.customizer__right--copy').html(`
        <strike class="gray">${priceToCurrency(price)}</strike>
        <span class="bold">3 for
          <span class="pink">${priceToCurrency(discount)}</span>
        </span>
      `);
    }

    $('.js-close-popup').trigger('click');
  };

  $('.customizer__left a').on('click', function(e) {
    e.preventDefault();

    const $product = $(this);
    const handle = $product.data('handle');
    $stackProduct = $product;

    $('.js-popup.quick-shop-popup').removeClass('hidden');
    $body.addClass('overflow-hidden');

    $.getJSON(`/products/${handle}`).then(({ product }) => {
      stackProduct = product;
      $('.js-quick-shop-options').empty();
      $('.js-quick-shop-title').text(product.title);
      $('.js-quick-shop-description').html(product.body_html);

      product.images.forEach(img => {
        $('<img />')
          .attr('src', img.src)
          .appendTo('.js-quick-shop-gallery');
      });

      const gallery = new Siema({
        selector: '.js-quick-shop-gallery',
        loop: true
      });

      $('.js-quick-shop-prev').on('click', () => {
        gallery.prev();
      });

      $('.js-quick-shop-next').on('click', () => {
        gallery.next();
      });

      product.options.forEach(option => {
        if (product.variants.length === 1) {
          addVariantToStack(product.variants[0]);
        }

        if (option.name !== 'Title') {
          const $wrapper = $('<div />').addClass('mb1');
          const $label = $('<label />')
            .text(option.name)
            .addClass('h6');
          const $selectWrapper = $('<div />').addClass('relative');

          const $select = $('<select />')
            .addClass('pointer o0p absolute t0 l0 w100p h100p')
            .data('position', `option${option.position}`)
            .data('name', option.name);

          const $activeValue = $('<div />')
            .addClass('select h6')
            .text(option.values[0]);

          option.values.forEach(v => {
            $('<option />')
              .text(v)
              .val(v)
              .appendTo($select);
          });

          $('.js-quick-shop-options').append(
            $wrapper
              .append($label)
              .append($selectWrapper.append($select).append($activeValue))
          );
        }
      });

      $('.js-quick-shop-options select').on('change', function(e) {
        $(this)
          .siblings('div')
          .text(e.target.value);
      });
    });

    $('.quick-shop-popup .js-close-popup').on('click', () => {
      $('.js-quick-shop-gallery').empty();
    });
  });

  $('.js-add-to-stack').on('click', e => {
    e.preventDefault();

    let filters = [];
    let selectedOptions = [];
    $('.js-quick-shop-options select').each(function() {
      filters = [
        ...filters,
        {
          position: $(this).data('position'),
          value: $(this).val()
        }
      ];
      selectedOptions = [
        ...selectedOptions,
        {
          name: $(this).data('name'),
          value: $(this).val()
        }
      ];
    });

    const variant = stackProduct.variants.find(v => {
      if (filters.length === 1) {
        return v[filters[0].position] === filters[0].value;
      } else if (filters.length === 2) {
        return (
          v[filters[0].position] === filters[0].value &&
          v[filters[1].position] === filters[1].value
        );
      }
    });

    $.getJSON(`/products/${stackProduct.handle}.js`).then(product => {
      const matchedVariant = product.variants.find(v => v.id === variant.id);

      if (matchedVariant.available) {
        addVariantToStack(matchedVariant, selectedOptions);
      } else {
        alert(
          'This option is curently unavailable :( Please select different options'
        );
      }
    });
  });

  $('.js-remove-stack-item').on('click', function() {
    const $slot = $(this).closest('.customizer__right--slot-img');
    const slot = $slot.data('slot-img');

    $slot.removeAttr('style').removeData('id');
    $('.customizer__right--copy').html(defaultCustomizerCopy);
    $(`[data-slot-options=${slot}]`).empty();
    $('.js-add-stack-to-bag').prop('disabled', true);
  });

  $('.category-item').on('click', function(e) {
    if ($(this).siblings().length > 0) {
      e.preventDefault();
      $(this)
        .siblings('div')
        .toggleClass('hide');
    }
  });

  $(window).on('scroll', () => {
    fadeInImage();
  });

  $(window).on('load', () => {
    updateCart();
    fadeInImage();

    if (breakpoint === 'sm') {
      return;
    }

    setProductImagesHeight();
    positionProductDetails();
  });

  $(window).on('resize', () => {
    setBreakpoint();

    if (breakpoint === 'sm') {
      return;
    }

    setProductImagesHeight();
    positionProductDetails();
  });
})(jQuery);
