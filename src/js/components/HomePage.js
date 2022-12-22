import { templates, select} from '../settings.js';

class HomePage{
  constructor(element){
    const thisHomePage = this;

    thisHomePage.render(element);
    thisHomePage.initActions();
  }
  render(element){
    const thisHomePage = this;

    thisHomePage.dom = {};
    thisHomePage.dom.wrapper = element;

    const generateHTML = templates.homePage();
    thisHomePage.dom.wrapper.innerHTML = generateHTML;

    setTimeout(thisHomePage.initCarousel, 500);


  }
  initCarousel(){
    const elem = document.querySelector('.main-carousel');
    const flkty = new Flickity( elem, {
      cellAlign: 'left',
      contain: true
    });
    console.log(flkty);

  }
  initActions(){
    const tileLink = document.querySelector(select.nav.tileLink);
    tileLink.addEventListener('click', function(){
      tileLink.classList.add('active');
    });
  }
}
export default HomePage;