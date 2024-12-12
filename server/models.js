class Event {
    summary = 'WorkShift';
    location = 'Finnoonristi 3, 02270 Espoo';
    description = 'WorkWorkWork';
    start = {
        dateTime: '',
        timeZone: 'Europe/Helsinki'
    };
    end = {
        dateTime: '',
        timeZone: 'Europe/Helsinki'
    };
    atendees = []

    constructor(start, end) {
        this.start.dateTime = start,
        this.end.dateTime = end
    }
}
module.exports = Event;