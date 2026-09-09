import { Progress } from "@/components/ui/progress";
import type { SkillScore } from "@/lib/types/app";
import { getMockSkillScores } from "@/lib/mock/skills";

interface SkillBarsProps {
  skills?: SkillScore[];
  compact?: boolean;
}

export function SkillBars({ skills, compact }: SkillBarsProps) {
  const data = skills ?? getMockSkillScores();
  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      {data.map((skill) => (
        <Progress
          key={skill.domain}
          value={skill.score}
          label={skill.label}
          showLabel
          size={compact ? "sm" : "md"}
        />
      ))}
    </div>
  );
}
