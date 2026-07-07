export function consentMessage(): string {
  return `👋 Hey, I'm Chief, your AI Chief of Staff.

Before we start, I need your consent to send you daily briefings and operational check-ins on WhatsApp.

1. Yes, let's go
2. No thanks`
}

export function quietHoursMessage(): string {
  return `🔕 When should I go quiet?

I won't send messages during these hours.

1. 10pm to 6am
2. 11pm to 7am
3. Midnight to 8am
4. No quiet hours`
}

export function briefingTimeMessage(): string {
  return `☀️ What time should your morning brief arrive?

1. 6:00 AM
2. 7:00 AM
3. 8:00 AM
4. 9:00 AM`
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
