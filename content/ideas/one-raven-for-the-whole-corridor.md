---
slug: one-raven-for-the-whole-corridor
chamber: 12
kind: idea
maturity: seed
themedMaturity: egg
publicationStatus: draft
title: One Raven for the Whole Corridor
summary: When one problem affects many parties but the intake channel only accepts one party per report, a consent-based relay can turn a single observation into one attributed report and one receipt per party.
date: 2026-11-25
---

<aside class="tales-from-below" aria-labelledby="tales-from-below-heading">
  <h2 id="tales-from-below-heading">Tales from Below</h2>
  <p>The overseer keeps a ledger of grievances, and every line has room for exactly one chamber. When the great door of the shared corridor jams, every chamber behind it is stuck. One imp climbs up and complains, one chamber is written down, and the others leave no mark. Later, only the chamber with the line can point to anything. So the corridor considers a raven. Each chamber that wants one hands it a seal, once. When trouble reaches them all, the raven carries one letter per seal and brings each chamber back a copy of its own delivery. The ledger fills with near-identical lines. The raven did not invent them: the ledger simply had no way to write "all of us".</p>
</aside>

## Behind the Stonework

Some problems are shared by nature. One incident affects several parties at once because they depend on the same resource: the same building, the same facility, the same service.

The channels for reporting such problems are often modelled differently. A web form takes one report for one party, keyed by that party's identifier. A hotline leaves no trace on the reporter's side at all. Nothing in the interface can express "this one incident affects all of us".

That is a mismatch between the domain model and the service interface:

- **Domain:** one incident, n affected parties.
- **Interface:** one report, exactly one party.

The record then attributes the incident to whoever happened to report it. Everyone else has nothing to point to later, even though they were affected just the same. The only way for every party to hold a record of its own is for every party to report separately: n times the effort for one problem.

## The idea

A small, opt-in relay on the side of the parties that compensates for the missing relation:

- **Registration with consent.** Each participating party provides the identifiers the intake channel requires, an email address, and consent to report shared problems on its behalf. The data is stored encrypted, used only for this purpose, and deleted when a party opts out.
- **One observation, n reports.** When a shared problem occurs, the relay submits the same report once per participating party. Each submission states that it is a joint report filed for the named parties.
- **Own copy for every party.** Every party receives an email with a readable summary and the raw request and response as an attachment. Each copy contains only that party's own data.
- **Event log.** Every event is logged with date, description, participating parties, and the responses of the intake channel.

The duplicates are deliberate. They are the faithful translation of one shared incident into an interface that can only count single parties.

## Hypothesis

Where an intake interface forces 1:1 attribution onto an n:1 reality, a thin, consent-based relay can give every affected party its own dated record for the effort of one. As a side effect, the duplicates make the mismatch visible to the provider.

## The upstream fix

The relay is a client-side adapter for a relation the provider's model lacks. The proper fix lives on the provider's side: an incident as an entity with a list of affected parties, the way issue trackers let others mark "affects me too", or a status page announces an outage once for everyone. A relay that the provider tolerates or adopts would be a step in that direction. A relay that floods them would only shift the cost.

The smallest version of that fix is almost embarrassingly simple: a checkbox saying "everyone at this location is affected". The provider already knows which parties share a location. The form just never asks. Two additions make it complete:

- **Fan-out of receipts.** The confirmation goes to every affected party, not only to the reporter. Only then does everyone hold a record of their own.
- **Fan-out of status.** Affected parties learn about the incident before they run into it. Whoever reads the notice knows a shared space is out of order before walking into it, instead of finding out on the spot.

With that in place, the duplicates become unnecessary, and so does the raven.

## Guardrails

- **No guessing.** Every identifier comes from the party itself. Nothing is derived or inferred.
- **No surprises for the provider.** The provider is told about joint reports before the first run, and every submission says what it is. Otherwise n near-identical reports from one sender look exactly like abuse.
- **No circumvention.** If a captcha or any other bot check appears, automation stops.
- **No test traffic.** The real intake channel only ever receives real reports.
- **No lock-in.** Every party stays free to report on its own as well.
- **Reports only.** Deadline-bound or legally significant declarations stay with each party.

## What the log can and cannot prove

A self-kept log of the HTTP exchange is the relay's own record, not proof of receipt. TLS gives no non-repudiation towards third parties. Two things strengthen it: a receipt issued by the provider, such as a case number or a confirmation email, and the copies themselves. Once every party holds its own copy, nobody can alter the record unnoticed afterwards, including the operator of the relay.

## Open questions

- Does the intake channel issue any receipt at all, or just a thank-you page? That decides how much the log is worth.
- Will the provider accept joint reports, or filter them as duplicates?
- Bus factor: who keeps the raven flying when its keeper moves on or loses interest?
- Where are the limits of acting on someone else's behalf once the circle grows beyond close personal relationships?
- Could the same pattern serve other n:1 situations, or is its value exactly that it stays small?
