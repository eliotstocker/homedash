import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { connect } from "pwa-helpers";
import store from "../state";

@customElement('info-bar')
export default class InfoBar extends connect(store)(LitElement) {
    static styles = css`
    .bar {
        padding: var(--tile-gap);
        overflow: hidden;
        text-overflow: ellipsis;
        color: rgba(255, 255, 255, 0.75);
        text-align: right;
    }

    .home {
        font-weight: 100;
        font-weight: 100;
        font-size: 4vw;
        text-transform: uppercase;
    }

    .room {
        font-weight: 400;
        margin-top: -25px;
    }

    .clock {
        font-weight: 600;
        font-size: 8vw;
    }

    .date {
        margin-top: -1.4vw;
        font-weight: 100;
        text-transform: uppercase;
        font-size: 1.8vw;
    }`;

    render() {
        return html`<div class="bar">
            <h1 class="home">${this.home}</h1>
            <!-- <h3 class="room">${this.room}</h3>        -->
            
            ${this.renderClock()}
            ${this.renderDate()}
        </div>`;
    }

    renderClock() {
        return html`<div class="clock">
            ${this.time}
        </div>`
    }

    renderDate() {
        return html`<div class="date">${this.date}
        </div>`
    }

    @property()
    home?: string;

    @property()
    room?: string;

    @property()
    time;

    @property()
    date;

    tickTimeout: Node.Timeout;

    stateChanged(state) {
        this.home = state.home.name;
        this.room = state.rooms.find(({id}) => id == state.app.room)?.name;
    }

    connectedCallback() {
        super.connectedCallback();
        this.tick();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        clearTimeout(this.tickTimeout);
    }

    tick() {
        const today = new Date();
    
        // get time components
        const hours = today.getHours();
        const minutes = today.getMinutes();
        const seconds = today.getSeconds();
    
        //add '0' to hour, minute & second when they are less 10
        const hour = hours < 10 ? "0" + hours : hours;
        const minute = minutes < 10 ? "0" + minutes : minutes;
        const second = seconds < 10 ? "0" + seconds : seconds;
    
        // get date components
        const month = today.getMonth();
        const year = today.getFullYear();
        const day = today.getDate();
    
        //declaring a list of all months in  a year
        const monthList = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December"
        ];

        const dateSuffix = [
            'th',
            'st',
            'nd',
            'rd',
            'th',
            'th',
            'th',
            'th',
            'th',
            'th'
        ]
    
        //get current date and time
        const date = day + "" + dateSuffix[day > 10 ? day.toString()[1] : day] + " of " + monthList[month] + " " + year;
        const time = hour + ":" + minute;
    
        this.date = date;
        this.time = time;
        this.tickTimeout = setTimeout(this.tick.bind(this), 1000);
      }
    
}