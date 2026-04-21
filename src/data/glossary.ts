import { GlossaryTerm } from "../types";

export const glossaryTerms: GlossaryTerm[] = [
  {
    term: "Ballot",
    definition: "The official document or method used to cast a vote in an election. Ballots can be paper-based, electronic, or mail-in.",
    relatedTerms: ["Provisional Ballot", "Absentee Ballot", "Mail-in Ballot"],
  },
  {
    term: "Caucus",
    definition: "A local meeting of registered party members to select delegates and express preference for a candidate. Unlike primaries, caucuses involve discussion and multiple rounds of voting.",
    relatedTerms: ["Primary Election", "Delegate"],
  },
  {
    term: "Delegate",
    definition: "A person chosen to represent their state at a national party convention and vote for a presidential nominee. Delegates can be pledged (bound to a candidate) or unpledged (superdelegates).",
    relatedTerms: ["Superdelegate", "Convention", "Caucus"],
  },
  {
    term: "Electoral College",
    definition: "The body of 538 electors established by the Constitution to formally elect the President and Vice President. Each state's electors equal its number of Congressional representatives.",
    relatedTerms: ["Elector", "Electoral Vote", "Faithless Elector"],
  },
  {
    term: "Elector",
    definition: "A member of the Electoral College chosen by each state to cast electoral votes for President and Vice President based on the state's popular vote results.",
    relatedTerms: ["Electoral College", "Faithless Elector"],
  },
  {
    term: "Faithless Elector",
    definition: "An elector who casts their electoral vote for someone other than the candidate who won their state's popular vote. Some states have laws penalizing or replacing faithless electors.",
    relatedTerms: ["Elector", "Electoral College"],
  },
  {
    term: "Gerrymandering",
    definition: "The manipulation of electoral district boundaries to favor a particular political party or group. Named after Governor Elbridge Gerry, whose 1812 redistricting plan created a salamander-shaped district.",
    relatedTerms: ["Redistricting", "Congressional District"],
  },
  {
    term: "Incumbent",
    definition: "The current holder of a political office who may be running for re-election. Incumbents often have advantages such as name recognition and access to campaign resources.",
    relatedTerms: ["Term Limit", "Re-election"],
  },
  {
    term: "Primary Election",
    definition: "A preliminary election where voters select their party's candidates for the general election. Primaries can be open (any voter) or closed (only party members).",
    relatedTerms: ["Open Primary", "Closed Primary", "Caucus"],
  },
  {
    term: "Provisional Ballot",
    definition: "A ballot cast by a voter whose eligibility is in question at the polling place. The ballot is set aside and counted only after the voter's eligibility is verified.",
    relatedTerms: ["Ballot", "Help America Vote Act"],
  },
  {
    term: "Superdelegate",
    definition: "An unpledged delegate to the Democratic National Convention — typically a party leader or elected official — who can support any candidate regardless of primary/caucus results.",
    relatedTerms: ["Delegate", "Convention"],
  },
  {
    term: "Swing State",
    definition: "A state where both major-party candidates have a competitive chance of winning, making it a focus of campaign resources. Also called battleground states.",
    relatedTerms: ["Battleground State", "Electoral College"],
  },
  {
    term: "Absentee Ballot",
    definition: "A ballot submitted by a voter who is unable to visit their polling place on Election Day. Some states require an excuse, while others allow no-excuse absentee voting.",
    relatedTerms: ["Mail-in Ballot", "Early Voting", "Ballot"],
  },
  {
    term: "Filibuster",
    definition: "A legislative tactic used in the U.S. Senate to delay or block a vote by extending debate. Ending a filibuster requires a cloture vote of 60 senators.",
    relatedTerms: ["Cloture", "Senate"],
  },
  {
    term: "Redistricting",
    definition: "The process of redrawing electoral district boundaries, typically after each census. This determines which voters are in each congressional district.",
    relatedTerms: ["Gerrymandering", "Census", "Congressional District"],
  },
];

export function searchGlossary(query: string): GlossaryTerm[] {
  const lowerQuery = query.toLowerCase();
  return glossaryTerms.filter(
    (term) =>
      term.term.toLowerCase().includes(lowerQuery) ||
      term.definition.toLowerCase().includes(lowerQuery),
  );
}

export function getGlossaryTerm(term: string): GlossaryTerm | undefined {
  return glossaryTerms.find(
    (t) => t.term.toLowerCase() === term.toLowerCase(),
  );
}
