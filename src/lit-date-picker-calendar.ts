import { LitElement, html, css, customElement, property, PropertyValues } from 'lit-element';
import { dateAllowed, dateEquals, getISOWeekNumber } from './utils/date';
import './lit-date-picker-day';

type DateObject = {
  day: number;
  month: number;
  year: number;
};

interface MonthCalendarI18n {
  monthNames: Array<string>;
  weekdays: Array<string>;
  weekdaysShort: Array<string>;
  firstDayOfWeek: 0 | 1;
  week: string;
  calendar: string;
  clear: string;
  today: string;
  cancel: string;
  formatDate: (date: DateObject) => string;
  formatTitle: (monthName: string, fullYear: number) => string;
}

interface WeekDay {
  weekDay: string;
  weekDayShort: string;
}

const defaultI18n: MonthCalendarI18n = {
  monthNames: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ],
  weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  firstDayOfWeek: 0,
  week: 'Week',
  calendar: 'Calendar',
  clear: 'Clear',
  today: 'Today',
  cancel: 'Cancel',
  formatDate(date) {
    return `${date.month + 1}/${date.day}/${date.year}`;
  },
  formatTitle(monthName, fullYear) {
    return `${monthName} ${fullYear}`;
  }
};

const getAriaLabel = (date: Date | null, today: Date, i18n: MonthCalendarI18n): string => {
  if (!date) {
    return '';
  }

  let ariaLabel = `${date.getDate()} ${i18n.monthNames[date.getMonth()]} ${date.getFullYear()}, ${
    i18n.weekdays[date.getDay()]
  }`;

  if (dateEquals(date, today)) {
    ariaLabel += `, ${i18n.today}`;
  }

  return ariaLabel;
};

const getDays = (month: Date, i18n: MonthCalendarI18n): Array<Date | null> => {
  if (month === undefined || i18n === undefined) {
    return [];
  }
  const { firstDayOfWeek } = i18n;
  // First day of the month (at midnight).
  const date = new Date(0, 0);
  date.setFullYear(month.getFullYear());
  date.setMonth(month.getMonth());
  date.setDate(1);

  // Rewind to first day of the week.
  while (date.getDay() !== firstDayOfWeek) {
    date.setDate(date.getDate() - 1);
  }

  const days = [];
  const startMonth = date.getMonth();
  const targetMonth = month.getMonth();
  while (date.getMonth() === targetMonth || date.getMonth() === startMonth) {
    days.push(date.getMonth() === targetMonth ? new Date(date.getTime()) : null);

    // Advance to next day.
    date.setDate(date.getDate() + 1);
  }

  return days;
};

const getTitle = (month: Date, i18n: MonthCalendarI18n): string => {
  if (month === undefined || i18n === undefined) {
    return '';
  }
  const { formatTitle, monthNames } = i18n;
  return formatTitle(monthNames[month.getMonth()], month.getFullYear());
};

const getWeekDayNames = (i18n: MonthCalendarI18n) => {
  const { weekdays, weekdaysShort, firstDayOfWeek } = i18n;

  const applyFirstDayOfWeek = (days: Array<string>) => {
    return days.slice(firstDayOfWeek).concat(days.slice(0, firstDayOfWeek));
  };

  const weekDayNames = applyFirstDayOfWeek(weekdays);
  const weekDayNamesShort = applyFirstDayOfWeek(weekdaysShort);

  return weekDayNames.map((day, index) => {
    return {
      weekDay: day,
      weekDayShort: weekDayNamesShort[index]
    };
  });
};

const getWeekNumber = (date: Date | null, days: Array<Date | null>): number => {
  if (date === undefined || days === undefined) {
    return NaN;
  }

  if (!date) {
    // Get the first non-null date from the days array.
    date = days.reduce((acc, d) => {
      return !acc && d ? d : acc;
    });
  }

  return date ? getISOWeekNumber(date) : NaN;
};

const getWeekNumbers = (dates: Array<Date | null>) => {
  return dates
    .map(date => getWeekNumber(date, dates))
    .filter((week, index, arr) => arr.indexOf(week) === index);
};

@customElement('lit-date-picker-calendar')
export class LitDatePickerCalendar extends LitElement {
  @property({ attribute: false }) i18n: MonthCalendarI18n = defaultI18n;

  @property({ attribute: false }) month: Date = new Date();

  @property({ attribute: false }) focusedDate: Date | null | undefined = null;

  @property({ attribute: false }) selectedDate: Date | null | undefined = null;

  @property({ attribute: false }) minDate: Date | null | undefined = null;

  @property({ attribute: false }) maxDate: Date | null | undefined = null;

  @property({ type: Boolean }) showWeekNumbers = false;

  @property({ type: Boolean, reflect: true }) disabled = false;

  @property({ attribute: false }) protected days: Array<Date | null> = [];

  @property({ type: Boolean }) protected showWeekSeparator = false;

  @property({ attribute: false }) protected weekDayNames: Array<WeekDay> = [];

  @property({ attribute: false }) protected weekNumbers: Array<number> = [];

  static styles = css`
    :host {
      display: block;
    }

    [part='weekdays'],
    #days {
      display: flex;
      flex-wrap: wrap;
      flex-grow: 1;
    }

    #days-container,
    #weekdays-container {
      display: flex;
    }

    [part='week-numbers'] {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      flex-shrink: 0;
    }

    [part='week-numbers'][hidden],
    [part='weekday'][hidden] {
      display: none;
    }

    [part='weekday'],
    [part='date'] {
      width: calc(100% / 7);
    }

    [part='weekday']:empty,
    [part='week-numbers'] {
      width: 12.5%;
      flex-shrink: 0;
    }

    /* Default theme */
    [part='weekday']:empty,
    [part='week-numbers'] {
      width: 2em;
    }

    [part='month-header'],
    [part='weekday'],
    [part='week-number'],
    [part='date'] {
      display: flex;
      justify-content: center;
      align-items: center;
      box-sizing: border-box;
      padding: 0.5rem 0;
      text-align: center;
    }

    [part='week-number'],
    [part='date'] {
      height: 2.5em;
    }

    [part='date'][focused] {
      background: #eee;
    }
  `;

  render() {
    const today = new Date();

    return html`
      <div part="month-header" role="heading">${getTitle(this.month, this.i18n)}</div>
      <div id="monthGrid">
        <div id="weekdays-container">
          <div ?hidden="${!this.showWeekSeparator}" part="weekday"></div>
          <div part="weekdays">
            ${this.weekDayNames.map((day: WeekDay) => {
              const { weekDay, weekDayShort } = day;
              return html`
                <div part="weekday" role="heading" aria-label="${weekDay}">${weekDayShort}</div>
              `;
            })}
          </div>
        </div>
        <div id="days-container">
          <div part="week-numbers" ?hidden="${!this.showWeekSeparator}">
            ${this.weekNumbers.map(number => {
              return html`
                <div part="week-number" role="heading" aria-label="${this.i18n.week} ${number}">
                  ${number}
                </div>
              `;
            })}
          </div>
          <div id="days">
            ${this.days.map((date: Date | null) => {
              const invalid = !dateAllowed(date, this.minDate, this.maxDate);
              return html`
                <lit-date-picker-day
                  part="date"
                  .date="${date}"
                  .today="${dateEquals(date, today)}"
                  .selected="${dateEquals(date, this.selectedDate)}"
                  .focused="${dateEquals(date, this.focusedDate)}"
                  .disabled="${invalid}"
                  aria-label="${getAriaLabel(date, today, this.i18n)}"
                  aria-disabled="${invalid}"
                  role="${date ? 'button' : 'presentation'}"
                ></lit-date-picker-day>
              `;
            })}
          </div>
        </div>
      </div>
    `;
  }

  updated(props: PropertyValues) {
    super.updated(props);

    if (props.has('month') && this.month) {
      this.days = getDays(this.month, this.i18n);

      this.weekNumbers = getWeekNumbers(this.days);
    }

    if (props.has('showWeekNumbers')) {
      const showSeparator = this.showWeekNumbers && this.i18n.firstDayOfWeek === 1;

      this.showWeekSeparator = showSeparator;

      if (showSeparator) {
        this.setAttribute('week-numbers', '');
      } else {
        this.removeAttribute('week-numbers');
      }
    }

    if (props.has('i18n')) {
      this.weekDayNames = getWeekDayNames(this.i18n);
    }
  }
}
