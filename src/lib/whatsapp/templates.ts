export function consentMessage(): string {
  return `Welcome to SoloChief.

I'm your Chief of Staff on WhatsApp. I'll send your morning briefing, flag follow-ups that need attention, and help you keep the week on track.

Just your commitments and follow-ups. No spam. No distractions.

Ready to set up?
1. Yes, set me up
2. Not now`
}

export function quietHoursMessage(): string {
  return `When should I stay quiet?

I won't send anything during your quiet hours.

Reply with a number:
1. 9pm to 7am (default)
2. 10pm to 8am
3. 11pm to 6am
4. No quiet hours`
}

export function briefingTimeMessage(): string {
  return `Last step. What time do you want your morning briefing?

Reply with a number:
1. 6am
2. 7am
3. 8am
4. Skip for now`
}

export function completeMessage(name: string): string {
  return `You're all set, ${name}.

Here's what I can do. Just reply with any of these:

*briefing* - your morning summary
*focus* - what to work on now
*follow-ups* - what's open
*plan* - your week
*capture* [something] - save a note
*done* [something] - mark it done
*help* - see this again

Your first briefing starts tomorrow morning.`
}

export function skippedMessage(): string {
  return `No problem. You can set up anytime by replying *setup*.`
}
