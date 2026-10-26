export interface Question {
  id: string;
  subject: string;
  topic: string;
  q: string;
  options: string[];
  answer: number;
  explanation: string;
}

export const QUESTIONS: Question[] = [
  {
    id: "q1",
    subject: "Physics",
    topic: "Kinematics",
    q: "A ball is thrown vertically upward at 20 m/s. Taking g = 10 m/s², how long does it take to reach its highest point?",
    options: ["1 s", "2 s", "4 s", "0.5 s"],
    answer: 1,
    explanation: "At the top, v = 0. Using v = u − gt → 0 = 20 − 10t, so t = 2 s.",
  },
  {
    id: "q2",
    subject: "Chemistry",
    topic: "Chemical Bonding",
    q: "What is the hybridisation of the central carbon atom in CO₂?",
    options: ["sp³", "sp²", "sp", "dsp²"],
    answer: 2,
    explanation: "Carbon forms two σ bonds and no lone pairs → 2 hybrid orbitals → sp, giving a linear 180° shape.",
  },
  {
    id: "q3",
    subject: "Mathematics",
    topic: "Calculus",
    q: "What is the derivative of f(x) = x² · sin x?",
    options: ["2x · cos x", "2x · sin x + x² · cos x", "x² · cos x", "2x · sin x − x² · cos x"],
    answer: 1,
    explanation: "Product rule: (uv)′ = u′v + uv′ = 2x · sin x + x² · cos x.",
  },
  {
    id: "q4",
    subject: "Physics",
    topic: "Electrostatics",
    q: "If the distance between two point charges is doubled, the electrostatic force between them becomes…",
    options: ["Double", "Half", "One-fourth", "Four times"],
    answer: 2,
    explanation: "Coulomb's law: F ∝ 1/r². Doubling r makes F become 1/4 of the original.",
  },
  {
    id: "q5",
    subject: "Mathematics",
    topic: "Probability",
    q: "Two fair coins are tossed. What is the probability of getting at least one head?",
    options: ["1/4", "1/2", "3/4", "1"],
    answer: 2,
    explanation: "P(no heads) = 1/4, so P(at least one head) = 1 − 1/4 = 3/4.",
  },
];
