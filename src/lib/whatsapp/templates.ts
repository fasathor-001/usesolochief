export function connectedMessage(name: string): string {
  return `🎯 Hey ${name}! Your Personal Chief of Staff here.

Your AI Chief of Staff is now active on WhatsApp. 🚀

Here's what I do:

📋 Send your morning brief every day
⚡ Let you log updates with a quick reply
🔔 Check in when things go quiet
🧠 Answer anything you throw at me

Ready to set up your daily rhythm?

Reply: 1 (Yes, let's go) or 2 (No thanks)`
}

export function consentMessage(): string {
  return `👋 Before we begin.

I'll send you:

☀️ A daily brief each morning
⚡ Quick check-ins during the day
🔔 Reminders when things need attention

I need your consent to send you messages on WhatsApp.

Do you agree?

1. ✅ Yes, let's go
2. ❌ No thanks`
}

export function quietHoursMessage(): string {
  return `🔕 When should I go quiet?

I won't send messages during these hours.
Pick what works for you:

1. 🌙 10pm to 6am
2. 🌙 11pm to 7am
3. 🌙 Midnight to 8am
4. 💡 No quiet hours`
}

export function briefingTimeMessage(): string {
  return `☀️ What time should your morning brief arrive?

Pick a time and I'll be there:

1. ⏰ 6:00 AM — Early riser
2. ⏰ 7:00 AM — First thing
3. ⏰ 8:00 AM — After coffee
4. ⏰ 9:00 AM — When I'm ready`
}

export function completeMessage(name: string, briefingHour: number | null): string {
  const timeMap: { [key: number]: string } = {
    6: '6:00 AM',
    7: '7:00 AM',
    8: '8:00 AM',
    9: '9:00 AM',
  }
  const briefingTime = briefingHour ? timeMap[briefingHour] || `${briefingHour}:00 AM` : 'custom time'

  return `🎉 You're all set, ${name}!

Your brief arrives at ☀️ ${briefingTime} every morning.

Here's what you can do right now:

*hi* or *briefing* ☀️ — Morning briefing
*focus* 🎯 — Today's focus
*follow-ups* 🔁 — Due follow-ups
*commitments* 📋 — Active commitments
*plan* 🗓 — This week's plan
*capture* [item] 💡 — Park an idea
*done* [name] ✅ — Close a follow-up
*help* 🤝 — This list

Full app 👉 solochief.app`
}

export function skippedMessage(): string {
  return `No problem. You can set up anytime by replying *setup*.`
}

export function expiredTokenMessage(): string {
  return `⏱ That link has expired.

Go back to SoloChief and tap *Connect WhatsApp* to get a fresh one.

👉 solochief.app`
}

export function alreadyConnectedMessage(): string {
  return `✅ You're already connected.

Send *hi* for your morning brief or *help* to see all commands. 🤝`
}

export function helpText(): string {
  return `🤝 *CHIEF COMMANDS*

☀️ *hi* or *briefing* — Morning briefing
🎯 *focus* — Today's focus
🔁 *follow-ups* — Due follow-ups
📋 *commitments* — Active commitments
🗓 *plan* — This week's plan
💡 *capture* [item] — Park an idea
✅ *done* [name] — Close a follow-up
🤝 *help* — This list

👉 Full app: solochief.app`
}

export function getTimeOfDayGreeting(firstName: string, timezone: string = 'UTC'): string {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    hour12: false,
    timeZone: timezone,
  })
  const hourStr = formatter.format(now)
  const hour = parseInt(hourStr, 10)

  let greeting: string
  let emoji: string

  if (hour >= 5 && hour < 12) {
    greeting = `Morning`
    emoji = `☀️`
  } else if (hour >= 12 && hour < 17) {
    greeting = `Afternoon`
    emoji = `☀️`
  } else if (hour >= 17 && hour < 21) {
    greeting = `Evening`
    emoji = `☀️`
  } else {
    greeting = `Hey`
    emoji = `👋`
  }

  return `${emoji} ${greeting}, ${firstName}.`
}
