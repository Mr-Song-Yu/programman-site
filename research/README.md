# Thailand travel page

Source: `../泰国旅行-资料`, two text notes and 11 screenshots supplied by the user. The original Programman homepage is recoverable from local branch `archive/programman-before-thailand-20260928` (commit `4ef982512bb7eae5148282aab2a95399c0b4aefe`). This project retains the existing GitHub Pages workflow and custom domain.

No month/year, flight number, arrival date or hotel was present in the supplied itinerary. Do not infer booked travel. The UI preserves calendar dates 4–8 and labels suggested times and unconfirmed reservations.

Corrections checked 2026-09-28:
- TDAC official FAQ: https://tdac.immigration.go.th/manual/en/faq.html . Free, within 3 days including arrival day; save confirmation/PDF.
- Airport bus operator: https://airportpattayabus.com/airport-pattaya/ . Lists 135 THB, roughly two hours, floor 1 gate 8, scheduled rather than always hourly service. Original note had 143 THB.
- Ferry reference (local tourism site, not an operator guarantee): https://hellokohlarn.com/travel . Tawaen last return 17:00, Nabaan last return 18:00. Always reconfirm at the pier. https://www.kohlarn.com/getting-to-koh-larn.html lists 30 THB one way and 35–45 minutes.
- Grand Palace: https://www.royalgrandpalace.th/en/visit/faq . 500 THB, ticket sales until 15:30, check closures.
- Emergency contacts: https://th.china-embassy.gov.cn/zgqz/1w1/index_5.htm . 1155, 191, 1669, +66 2 245 7010, +86 10 12308. Do not prepend +66 to emergency short codes.

Food and shopping are personal collections from the supplied notes; current branch locations, availability and prices are not verified. AI-edited product cutouts link to original screenshots. Screenshot cosmetic efficacy claims are not reproduced. Original herb-soap label conflicts with the photo (Ginger Soap), so UI flags this. River evening duplicated between source notes: prioritize 7th, leave 6th optional.

Images were generated with the built-in imagegen tool: island panorama (Koh Larn inspired, no limestone karsts), Thai food still life, and transparent 3×2 product cutout sprite derived from supplied screenshots. Scenic photos are labeled as AI illustrations in the source details. Originals stay in the Codex generated_images directory; production WebP assets are in public/travel. Original screenshot content is preserved in WebP references. Outfit font is locally hosted with its OFL license.

Build: npm run build. Preview: npm run dev. Checklist and shopping list are local to the user's browser, with storage failures handled. Theme follows system initially and can be toggled. All five days are included when printing.
