// Static blog content — no DB, pure SEO plays for the Tampa cleaning niche.

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO
  readMinutes: number;
  tag: "Airbnb" | "Move-in / Move-out" | "Home cleaning";
  // Rendered as ordered blocks. Keep simple so we don't need MDX.
  blocks: Array<
    | { type: "p"; text: string }
    | { type: "h2"; text: string }
    | { type: "ul"; items: string[] }
    | { type: "quote"; text: string }
  >;
};

export const POSTS: BlogPost[] = [
  {
    slug: "airbnb-turnover-checklist-tampa",
    title: "The Airbnb turnover checklist Tampa hosts actually use",
    description:
      "A same-day turnover checklist for Tampa Airbnb hosts — linens, kitchen reset, bathroom refresh, and the photo handoff that stops guest complaints.",
    date: "2026-05-18",
    readMinutes: 6,
    tag: "Airbnb",
    blocks: [
      {
        type: "p",
        text: "If you host a short-term rental in Tampa, the difference between a 5-star review and a refund request usually comes down to the turnover. Not the deep clean. The turnover. Here's the checklist our crew actually follows between guests — the one we hand new cleaners on day one.",
      },
      { type: "h2", text: "Before you touch anything: photos" },
      {
        type: "p",
        text: "The first thing our team does is photograph the space as the last guest left it. Not to shame anyone — to protect the host. If a guest disputes damage or a missing item later, timestamped photos before you start cleaning end the conversation in about 30 seconds.",
      },
      { type: "h2", text: "Linens & beds (do this first)" },
      {
        type: "ul",
        items: [
          "Strip every bed, including decorative pillow shams.",
          "Start laundry immediately — it runs while you clean everything else.",
          "Check mattress protectors for stains; swap, don't just spot-treat.",
          "Make beds hotel-tight with fresh linens from your par stock.",
        ],
      },
      { type: "h2", text: "Kitchen reset" },
      {
        type: "ul",
        items: [
          "Empty and wipe the fridge — guests forget half a lime and a yogurt every single time.",
          "Run the dishwasher even if it looks empty; guests reload it wrong.",
          "Restock coffee, filters, dish soap, sponges, paper towels, trash bags.",
          "Wipe cabinet fronts around the handles — that's where fingerprints show on your listing photos when the next guest posts.",
        ],
      },
      { type: "h2", text: "Bathrooms" },
      {
        type: "ul",
        items: [
          "Fresh towel stack per guest, not per bathroom — count heads.",
          "Descale the shower glass; Tampa water leaves a film after two guests.",
          "New toilet paper roll started, plus one spare visible.",
          "Toss the bath mat in the wash — it's the #1 thing hosts skip and guests notice.",
        ],
      },
      { type: "h2", text: "The photo handoff (this is the trick)" },
      {
        type: "p",
        text: "Before your cleaner leaves, they should send you photos of every room in its final state: made beds, empty sinks, folded towels, staged coffee bar. Two upsides — you catch problems before the guest does, and if the guest ever claims 'the place was dirty,' your photos timestamped 30 minutes before check-in end the dispute.",
      },
      {
        type: "quote",
        text: "The photo handoff is the single change that dropped our refund requests from about 1 in 20 stays to under 1 in 100.",
      },
      { type: "h2", text: "What we do differently at Amanda Florida" },
      {
        type: "p",
        text: "We sync your Airbnb or VRBO calendar so turnovers auto-appear the day a guest checks out — you don't have to text us. Every clean ends with a photo checklist in your inbox. Get a real turnover quote by chat in about a minute.",
      },
    ],
  },
  {
    slug: "move-out-cleaning-tampa-deposit",
    title: "Move-out cleaning in Tampa: what it takes to get your deposit back",
    description:
      "What Tampa landlords actually check on a move-out, what a deposit-ready clean includes, and where DIY move-outs cost renters their security deposit.",
    date: "2026-06-04",
    readMinutes: 5,
    tag: "Move-in / Move-out",
    blocks: [
      {
        type: "p",
        text: "Most renters in Tampa don't lose their deposit because the place was dirty. They lose it because two or three specific things weren't done — and the landlord uses those as the excuse to keep everything. Here's what we've learned booking hundreds of move-out cleans across Hillsborough County.",
      },
      { type: "h2", text: "What landlords actually inspect" },
      {
        type: "ul",
        items: [
          "Inside the oven and behind the stove — grease under the burners.",
          "Inside the fridge, freezer, and the seals around the door.",
          "Baseboards and door frames — dust and scuffs.",
          "Blinds, ceiling fans, and light fixtures — the stuff nobody dusts monthly.",
          "Bathroom grout and caulking — pink or black spots cost you.",
          "Inside cabinets and drawers — crumbs and shelf liners.",
        ],
      },
      { type: "h2", text: "Where DIY move-outs fail" },
      {
        type: "p",
        text: "The classic mistake is cleaning like it's a normal weekend clean — surfaces look great, but the oven is untouched and the blinds are dusty. Deposit-ready cleaning is a different job. It's slower, it uses degreaser and non-scratch scrub pads, and it takes a team 3-5 hours in a two-bedroom.",
      },
      { type: "h2", text: "What a deposit-ready clean should include" },
      {
        type: "ul",
        items: [
          "Full oven interior + stovetop deep clean.",
          "Fridge & freezer emptied, wiped, and defrosted if needed.",
          "Inside every cabinet, drawer, and closet.",
          "Baseboards, door frames, light switches, outlet covers.",
          "Blinds cleaned slat by slat (or replaced if brittle).",
          "Bathrooms descaled, grout scrubbed, caulking re-checked.",
          "Floors mopped last — carpet vacuumed edge-to-edge.",
        ],
      },
      { type: "h2", text: "How to book without stress" },
      {
        type: "p",
        text: "Tell us the bedroom count, whether the place is furnished on move-out day, and roughly what shape it's in. We'll quote a real, flat price by chat — no upsells at the door. Book a move-out clean in Tampa.",
      },
    ],
  },
  {
    slug: "how-often-clean-house-tampa",
    title: "How often should you clean your house in Tampa?",
    description:
      "A practical cleaning cadence for Tampa homes — how humidity, pollen, and pets change what 'clean' means, and where to hire out vs. DIY.",
    date: "2026-06-22",
    readMinutes: 4,
    tag: "Home cleaning",
    blocks: [
      {
        type: "p",
        text: "Tampa isn't a normal cleaning environment. Humidity keeps dust sticky, pollen coats everything from March through May, and beach sand travels farther than you'd think. Here's the cadence we recommend to clients — and where paying someone actually beats DIY.",
      },
      { type: "h2", text: "Weekly (do it yourself)" },
      {
        type: "ul",
        items: [
          "Kitchen counters, stovetop, sink — every 1-2 days really.",
          "Bathroom quick-wipe: mirror, sink, toilet exterior.",
          "Vacuum the main traffic path.",
          "Take the trash out (Tampa heat + food waste = fruit flies in 48 hours).",
        ],
      },
      { type: "h2", text: "Every 2 weeks (hire out or block a Saturday)" },
      {
        type: "ul",
        items: [
          "Full mop, full vacuum including under furniture.",
          "Shower & tub scrub — Tampa water scale builds fast.",
          "Dust every horizontal surface + ceiling fans.",
          "Wipe kitchen cabinet fronts around handles.",
        ],
      },
      { type: "h2", text: "Every 3 months (deep clean)" },
      {
        type: "ul",
        items: [
          "Inside the oven and fridge.",
          "Baseboards and door frames.",
          "Blinds and window tracks (pollen collects here).",
          "Under-couch, under-bed vacuum.",
          "Grout and caulking check.",
        ],
      },
      { type: "h2", text: "Where paying for cleaning actually pays off" },
      {
        type: "p",
        text: "If you're working full time, the 'every 2 weeks' clean is the one worth hiring out. It's the visit that keeps everything else easy — miss it twice and the next deep clean is twice as long. A bi-weekly recurring clean in Tampa runs less than what most people spend on takeout in the same two weeks.",
      },
      {
        type: "p",
        text: "Want a real number for your place? Chat with us — quote in about a minute.",
      },
    ],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}
