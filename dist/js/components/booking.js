
import { classNames, select, settings, templates } from '../settings.js';
import { utils } from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getDate();
    thisBooking.selectedTable = '';
  }

  getDate() {
    const thisBooking = this;

    const startDateParam =
      settings.db.dateStartParamKey +
      '=' +
      utils.dateToStr(thisBooking.DatePicker.minDate);
    const endDateParam =
      settings.db.dateEndParamKey +
      '=' +
      utils.dateToStr(thisBooking.DatePicker.maxDate);

    const params = {
      bookings: [startDateParam, endDateParam],
      eventsCurrent: [settings.db.notRepeatParam, startDateParam, endDateParam],
      eventsRepeat: [settings.db.repeatParam, endDateParam]
    };

    const urls = {
      bookings:
        settings.db.url +
        '/' +
        settings.db.bookings +
        '?' +
        params.bookings.join('&'),
      eventsCurrent:
        settings.db.url +
        '/' +
        settings.db.events +
        '?' +
        params.eventsCurrent.join('&'),
      eventsRepeat:
        settings.db.url +
        '/' +
        settings.db.events +
        '?' +
        params.eventsRepeat.join('&')
    };

    Promise.all([
      fetch(urls.bookings),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat)
    ])
      .then(function (allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json()
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.DatePicker.minDate;
    const maxDate = thisBooking.DatePicker.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (
          let loopDate = minDate;
          loopDate <= maxDate;
          loopDate = utils.addDays(loopDate, 1)
        ) {
          thisBooking.makeBooked(
            utils.dateToStr(loopDate),
            item.hour,
            item.duration,
            item.table
          );
        }
      }
    }

    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (
      let hourBlock = startHour;
      hourBlock < startHour + duration;
      hourBlock += 0.5
    ) {

      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.DatePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.HourPicker.value);

    let allAvailable = false;

    if (
      typeof thisBooking.booked[thisBooking.date] == 'undefined' ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] =='undefined') {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if (
        !allAvailable &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }
  selectTable(clickedElement) {
    const thisBooking = this;
    const tableId = clickedElement.getAttribute('data-table');
    const isTable = tableId && clickedElement.classList.value.includes('table');

    const isTableBooked = clickedElement.classList.value.includes('booked');
    const isTableSelected = clickedElement.classList.value.includes(classNames.booking.selected);

    if (isTable && !isTableBooked) {
      if (isTableSelected) {
        thisBooking.unselectTables();
        thisBooking.selectedTable = '';
      } else {
        thisBooking.unselectTables();
        clickedElement.classList.add(classNames.booking.selected);
        thisBooking.selectedTable = tableId;
      }
    }
    console.log(thisBooking.selectedTable);
  }
  unselectTables() {
    const thisBooking = this;

    for (let table of thisBooking.dom.tables) {
      table.classList.remove(classNames.booking.selected);
    }
  }
  


  render(element) {
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.floorPlan = thisBooking.dom.wrapper.querySelector(select.booking.floorPlan);
    thisBooking.dom.submit = document.querySelector(select.booking.submit);
    thisBooking.dom.durationInput = document.querySelector(select.booking.durationInput);
    thisBooking.dom.peopleInput = document.querySelector(select.booking.peopleInput);
    thisBooking.dom.address = document.querySelector(select.booking.address);
    thisBooking.dom.phone = document.querySelector(select.booking.phone);
    thisBooking.dom.starters = document.querySelectorAll(select.booking.starters);
  }
  sendBooking(){
    const thisBooking = this;
    console.log(thisBooking.selectedTable);
    const url = settings.db.url + '/' + settings.db.bookings;

    if(typeof thisBooking.selectedTable == 'undefined'){
      window.alert('Please choose a table');
    }
    else {
      const payload = {
        date: thisBooking.selectedTable.date,
        hour: thisBooking.selectedTable.hour,
        table: parseInt(thisBooking.selectedTable.tableId),
        duration: parseInt(thisBooking.dom.durationInput.value),
        ppl: parseInt(thisBooking.dom.peopleInput.value),
        starters: [],
        phone: thisBooking.dom.phone.value,
        adress: thisBooking.dom.address.value,
      };

      for(let starter of thisBooking.dom.starters){
        if (starter.checked){
          payload.starters.push(starter.value);
        }
      }
      console.log('payload', payload);
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };

      fetch(url, options)
        .then(thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table))
        .then(thisBooking.updateDOM());
        
      console.log(thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table));
    }
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.AmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.dom.peopleAmount.addEventListener('updated', function () {});
    thisBooking.AmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.hoursAmount.addEventListener('updated', function () {});
    thisBooking.DatePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.HourPicker = new HourPicker(thisBooking.dom.hourPicker);
    

    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.updateDOM();
      if (event.target == thisBooking.dom.hourPicker || event.target == thisBooking.dom.datePicker){
        thisBooking.unselectTables();
      }

    });
    
    thisBooking.dom.floorPlan.addEventListener('click', function (event) {
      thisBooking.selectTable(event.target);
    });
    thisBooking.dom.submit.addEventListener('click', function(event){
      event.preventDefault();
      thisBooking.sendBooking();
    });
  }
}

export default Booking;