# SmartTeamFoundation — AI Skill-Matching & Team Formation Engine

## 1. Algorithmic Overview

The SmartTeamFoundation Matching Engine is an **explainable, deterministic, multi-attribute decision-making system** designed to solve the college project team formation problem.

Rather than relying on non-deterministic LLM tokens or opaque black-box embeddings, the core algorithm mathematically evaluates 6 weighted parameters derived directly from student database records and project specifications:

| Parameter | Notation | Default Weight | Description |
| :--- | :---: | :---: | :--- |
| **Technical Skill Overlap** | $S_{\text{overlap}}$ | **40%** | Proportion of required skills possessed by candidate, weighted by skill importance. |
| **Skill Proficiency Ratio** | $S_{\text{prof}}$ | **20%** | Whether candidate proficiency meets or exceeds required proficiency levels. |
| **Project Interest Alignment** | $S_{\text{int}}$ | **15%** | Semantic & keyword alignment between candidate interests and project domain. |
| **Preferred Role Fit** | $S_{\text{role}}$ | **10%** | Concordance between candidate preferred roles and unfilled project positions. |
| **Relevant Experience Tier** | $S_{\text{exp}}$ | **10%** | Candidate experience level vs project complexity difficulty + years of practice. |
| **Weekly Availability Fit** | $S_{\text{avail}}$ | **5%** | Candidate weekly available hours vs project weekly time commitment requirement. |

**Total Compatibility Score:**
$$\text{Score}(C, P) = \min\left(100, \sum_{i=1}^{6} W_i \cdot S_i(C, P)\right)$$

Where $\sum_{i=1}^6 W_i = 100$.

---

## 2. Mathematical Formulation of Components

### 2.1 Technical Skill Overlap ($W_1 = 40$)
Let $R$ be the set of skills required by Project $P$, where each skill $r \in R$ has an importance weight $w(r)$:
- Required = $1.0$
- Preferred = $0.75$
- Nice to have = $0.5$

Let $K_C$ be the set of skills possessed by Candidate $C$. The overlap ratio is:
$$\text{Ratio}_{\text{overlap}} = \frac{\sum_{r \in R \cap K_C} w(r)}{\sum_{r \in R} w(r)}$$

$$S_{\text{overlap}} = \text{Ratio}_{\text{overlap}} \times 40$$

### 2.2 Skill Proficiency Ratio ($W_2 = 20$)
Proficiency tiers are mapped to numeric values:
$$\text{Beginner} = 1, \quad \text{Intermediate} = 2, \quad \text{Advanced} = 3, \quad \text{Expert} = 4$$

For each matching skill $s \in R \cap K_C$, the proficiency satisfaction $\text{sat}(s)$ is defined as:
$$\text{sat}(s) = \begin{cases} 1.0 & \text{if } \text{Prof}_C(s) \ge \text{Prof}_P(s) \\ \frac{\text{Prof}_C(s)}{\text{Prof}_P(s)} & \text{if } \text{Prof}_C(s) < \text{Prof}_P(s) \end{cases}$$

The overall proficiency ratio across all matching skills is:
$$\text{Ratio}_{\text{prof}} = \frac{\sum_{s \in R \cap K_C} \text{sat}(s) \cdot w(s)}{\sum_{s \in R \cap K_C} w(s)}$$

$$S_{\text{prof}} = \text{Ratio}_{\text{prof}} \times 20$$

### 2.3 Project Interest Alignment ($W_3 = 15$)
Evaluates domain keyword matches between candidate stated interests $I_C$ and project domain/title/description $T_P$:
$$\text{Ratio}_{\text{int}} = \min\left(1.0, \frac{\text{matches}(I_C, T_P) \times 1.5}{|I_C|}\right)$$

$$S_{\text{int}} = \text{Ratio}_{\text{int}} \times 15$$

### 2.4 Preferred Role Compatibility ($W_4 = 10$)
Matches candidate preferred roles against project open roles:
$$\text{Ratio}_{\text{role}} = \begin{cases} 1.0 & \text{if exact role match exists} \\ 0.7 & \text{if partial keyword match exists} \\ 0.3 & \text{otherwise} \end{cases}$$

$$S_{\text{role}} = \text{Ratio}_{\text{role}} \times 10$$

### 2.5 Relevant Experience Tier ($W_5 = 10$)
Compares candidate experience level with project difficulty (Beginner, Intermediate, Advanced) plus practical years of experience:
$$S_{\text{exp}} = \text{Ratio}_{\text{exp}} \times 10$$

### 2.6 Weekly Availability Fit ($W_6 = 5$)
Let $H_C$ be candidate weekly availability and $H_P$ be required project weekly commitment:
$$\text{Ratio}_{\text{avail}} = \begin{cases} 1.0 & \text{if } H_C \ge H_P \\ \frac{H_C}{H_P} & \text{if } H_C < H_P \end{cases}$$

$$S_{\text{avail}} = \text{Ratio}_{\text{avail}} \times 5$$

---

## 3. Skill Gap Analysis Formula

For a project with required skills $R$ and confirmed team members $M$:
1. Let $T_{\text{skills}}$ be the union of all skills possessed by members in $M$.
2. For each required skill $r \in R$:
   - **Covered:** $r \in T_{\text{skills}}$ and $\max_{m \in M} \text{Prof}_m(r) \ge \text{Prof}_{\text{req}}(r)$
   - **Partially Covered:** $r \in T_{\text{skills}}$ and $\max_{m \in M} \text{Prof}_m(r) < \text{Prof}_{\text{req}}(r)$
   - **Missing:** $r \notin T_{\text{skills}}$

**Project Skill Coverage Percentage:**
$$\text{Coverage \%} = \frac{\sum_{r \in \text{Covered}} w(r) + \sum_{r \in \text{Partial}} w(r) \cdot \left(\frac{\max \text{Prof}(r)}{\text{ReqProf}(r)}\right)}{\sum_{r \in R} w(r)} \times 100$$

---

## 4. Greedy Balanced Team Formation Algorithm

To avoid recommending a team of clones with identical skillsets, the system executes a greedy selection loop:

```
Algorithm GreedyTeamFormation(Project P, ExistingTeam M, Candidates C, TargetSize K):
    OpenPositions = K - |M|
    SimulatedTeam = Copy(M)
    SelectedRecommendations = []

    For step = 1 to OpenPositions:
        If Candidates is empty: Break

        BestCandidate = null
        BestScore = -infinity

        For each candidate c in Candidates:
            BaseMatch = CalculateStudentProjectMatch(c, P, SimulatedTeam)

            # Complementary bonus for skills not yet covered in SimulatedTeam
            UncoveredSkillsCoveredByCandidate = ContributedSkills(c, SimulatedTeam)
            ComplementaryBonus = |UncoveredSkillsCoveredByCandidate| * 15

            CompositeScore = BaseMatch.CompatibilityScore + ComplementaryBonus

            If CompositeScore > BestScore:
                BestScore = CompositeScore
                BestCandidate = c
                BestMatchDetails = BaseMatch

        If BestCandidate is found:
            Remove BestCandidate from Candidates
            Add BestCandidate to SimulatedTeam
            Add { Candidate: BestCandidate, Rank: step, MatchDetails: BestMatchDetails } to SelectedRecommendations

    Return SelectedRecommendations
```

---

## 5. Automated Test Coverage (10 Test Cases)

The algorithm is verified against 10 comprehensive edge cases in `backend/tests/matching.test.js`:
1. **Full Match:** Student possessing all required skills with high proficiency ($\ge 80\%$).
2. **Partial Match:** Student possessing only some skills receives proportional score and lists missing skills.
3. **Low Availability:** Student possessing skills but insufficient hours is flagged with reduced availability score.
4. **Skill Gap Analysis:** Accurately identifies covered, partial, and missing skills with candidate solutions.
5. **No Candidates:** Returns clean status without errors when pool is exhausted.
6. **Full Team:** Correctly detects team size capacity reached and halts additions.
7. **Zero Current Members:** Successfully seeds initial recommendations.
8. **Existing Member Exclusion:** Strictly filters current members out of recommendations.
9. **Incomplete Requirements:** Baseline fallback (50%) with clear explainable guidance.
10. **Requirement Mutation:** Dynamic recalculation when project requirements change.
