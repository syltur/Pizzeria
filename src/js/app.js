import {settings, select, classNames} from './settings.js';
import Product from './components/product.js';
import Cart from './components/cart.js';
import Booking from './components/booking.js';
import HomePage from './components/HomePage.js';

const app = {
  initHomePage: function(){
    const thisApp = this;

    const homePageElem = document.querySelector(select.containerOf.homePage);
    thisApp.homePage = new HomePage(homePageElem);
  },
  initPages: function(){
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);
    console.log('thisApp', thisApp.navLinks);

    const idFromHash = window.location.hash.replace('#/','');

    let pageMatchingHash = thisApp.pages[0].id;

    for (let page of thisApp.pages){
      if(page.id == idFromHash){
        pageMatchingHash = page.id;
        break;
      }
    }

    thisApp.activatePage(pageMatchingHash);

    for (let link of thisApp.navLinks){
      link.addEventListener('click', function(event){
        const clickedElement = this;
        event.preventDefault();

        const id = clickedElement.getAttribute('href').replace('#', '');
        thisApp.activatePage(id);

        /*my idea without 'const clickedElement = this': one line instead of three*/
        // thisApp.activatePage(event.target.getAttribute('href').slice(1));

        /*change URL hash */
        window.location.hash = '#/' + id;
      });
    }
  },
  initBooking: function(){
    const thisApp = this;

    const bookingElem = document.querySelector(select.containerOf.booking);
    thisApp.booking = new Booking(bookingElem);
  },
  activatePage: function (pageId){
    const thisApp = this;

    /*add class "active" to matching pages, remove from non-matching*/
    for(let page of thisApp.pages){
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }
    /*add class "active" to matching links, remove from non-matching*/
    for(let link of thisApp.navLinks){
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#'+pageId
      );
    }
  },
  initMenu: function(){
    const thisApp = this;
    console.log('thisApp.data', thisApp.data);
    for(let productData in thisApp.data.products){
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },
  initData: function(){
    const thisApp = this;
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.products;
    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parsedResponse){
        thisApp.data.products = parsedResponse;
        thisApp.initMenu();
      });
  },
  initCart: function(){
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    });
  },
  init: function(){
    const thisApp = this;
    // console.log('*** App starting ***');
    // console.log('thisApp:', thisApp);
    // console.log('settings:', settings);
    thisApp.initData();
    thisApp.initCart();
    thisApp.initHomePage();
    thisApp.initPages();
    thisApp.initBooking();

  },
};

app.init();
