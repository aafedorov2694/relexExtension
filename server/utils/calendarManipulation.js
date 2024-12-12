const { google } = require('googleapis');
const { oAuth2Client } = require('./auhtorization');
const Event = require('../models');


const deleteDev = async () => {
    const calendar = await google.calendar({ version: 'v3', auth: oAuth2Client });

    try {
        const resp = await calendar.events.list({
            calendarId: 'primary',
            timeMin: new Date().toISOString(),
            timeMax: new Date(new Date('2024-06-30')).toISOString()
        })

        const events = resp.data.items;
        if (events.length) {
            console.log(`Found ${events.length} events. Deleting...`);

            // Delete each event
            for (const event of events) {
                await calendar.events.delete({
                    calendarId: 'primary',
                    eventId: event.id,
                });
                console.log(`Deleted event: ${event.summary}`);
            }
        } else {
            console.log('No events found.');
        }
        return 'events are here'
    } catch (error) {
        console.log('error fetcing the events in deleteDev: ', error)
        return 'sorry error'
    }
}

const deleteEvent = async (shiftsToDelete) => {
    const calendar = await google.calendar({ version: 'v3', auth: oAuth2Client });
    try {
        shiftsToDelete.forEach(e => {
            calendar.events.delete({
                calendarId: 'primary',
                eventId: e.id
            }, function (err, e) {
                if (err) {
                    console.log('There was an error deleting events from a calendar: ' + err);
                }
            }
            )
        })
        return 'ok';
    } catch (err) {
        console.log('error while deleting events: ', err)
    }
}


const insertEvents = async (shiftsToAdd) => {
    const calendar = await google.calendar({ version: 'v3', auth: oAuth2Client });
    try {
        shiftsToAdd.forEach(e => {
            calendar.events.insert({
                calendarId: 'primary',
                resource: e
            }, function (err, e) {
                if (err) {
                    console.log('There was an error contacting the Calendar service: ' + err);
                    return;
                }
                console.log('Event created: %s', e);
            })
        })
        return 'ok'
    } catch (err) {
        console.log('Error on insert: ', err)
    }

}


//Accepts all the new incoming shifts and checks if they already exist in the calendar.
const shiftEventComparison = async (shifts) => {
    const date = new Date()
    const yesterday = new Date(date.setDate(date.getDate() - 1))
    const calendar = await google.calendar({ version: 'v3', auth: oAuth2Client });
    const newShiftsToAdd = []
    const shiftsToDelete = []

    try {
        const mainCal = await calendar.events.list({ calendarId: 'primary', q: 'WorkWorkWork', timeMin: yesterday })
        mainCal.data.items.forEach(e => console.log('start: ', e.start.dateTime, '  end: ', e.end.dateTime))
        shifts.forEach(e => console.log('shifts in shiftEventComparison: ', e.end.dateTime, e.start.dateTime))
        const existingEvents = mainCal.data.items

        for (const newShift of shifts) {
            let newShiftCount = 0
            let breakCount = 0
            existingEvents.forEach(e => {
                if (e.start.dateTime.slice(0, 19) === newShift.start.dateTime && e.end.dateTime.slice(0, 19) === newShift.end.dateTime) {
                    newShiftCount = newShiftCount + 1
                } else {
                    if (newShift.end.dateTime.includes('break')) {
                        breakCount = breakCount + 1
                    }
                }
            })
            if (newShiftCount === 0) {
                if (breakCount === 0) {
                    newShiftsToAdd.push(newShift)
                }
                existingEvents.forEach(e => {
                    if (e.start.dateTime.slice(0, 10) === newShift.start.dateTime.slice(0, 10)) {
                        shiftsToDelete.push(e)
                    }
                })
            }

        }
        console.log('new shifts length: ', shifts.length)
        console.log('newShiftsToAdd: ', newShiftsToAdd.length)
        shiftsToDelete.forEach(e => console.log('shiftTodelete: ', e.start))

    } catch (err) {
        console.log('getMainCal error: ', err)
        return err
    }
    if (shiftsToDelete.length > 0) {
        const removeEvents = await deleteEvent(shiftsToDelete)
        if (removeEvents === 'ok') {
            const insert = await insertEvents(newShiftsToAdd)
            return insert
        }
    } else {
        const insert = await insertEvents(newShiftsToAdd)
        return insert
    }

}


const eventCreation = async (shifts) => {
    const shiftsForEvent = []
    //console.log('shifts: ', shifts)
    for (const e of shifts) {

        const startTime = e.tasks.length > 0 ? e.tasks[0].startTime : `${e.date} break`;
        const endTime = e.tasks.length > 0 ? e.tasks[e.tasks.length - 1].endTime : `${e.date} break`;

        const ev = new Event(startTime, endTime)
        shiftsForEvent.push(ev)
    }
    try {
        const updateCalendar = await shiftEventComparison(shiftsForEvent);

        return updateCalendar

    } catch (err) {
        console.log('Error upon initializing shiftEventComparison: ', err)
    }


}

module.exports = { eventCreation, deleteDev }
