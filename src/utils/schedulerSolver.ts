import { Assignment, ClassItem, TimeSlot, ScheduleSlot, ScheduleConflict, Teacher } from '../types';

/**
 * Checks for conflicts in the schedule
 */
export function checkConflicts(
  slots: ScheduleSlot[],
  assignments: Assignment[],
  teachers: Teacher[],
  classes: ClassItem[]
): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];
  const teacherLookup = new Map(teachers.map(t => [t.id, t]));
  const classLookup = new Map(classes.map(c => [c.id, c]));
  const assignmentLookup = new Map(assignments.map(a => [a.id, a]));

  // 1. Check for teacher double bookings (A teacher assigned to 2 classes at the same day + period)
  // Key: day-period-teacherId -> slot
  const teacherTimeMap = new Map<string, ScheduleSlot>();

  // 2. Check for class double bookings (A class assigned to 2 subjects at the same day + period)
  // Key: day-period-classId -> slot
  const classTimeMap = new Map<string, ScheduleSlot>();

  // 3. Keep track of assigned hours per assignment
  const hoursCount = new Map<string, number>();

  for (const slot of slots) {
    if (!slot.assignmentId || slot.assignmentId === 'BREAK') continue;

    const assignment = assignmentLookup.get(slot.assignmentId);
    if (!assignment) continue;

    const teacher = teacherLookup.get(assignment.teacherId);
    const classItem = classLookup.get(slot.classId);

    // Track hours
    hoursCount.set(slot.assignmentId, (hoursCount.get(slot.assignmentId) || 0) + 1);

    // Check teacher double booking
    if (teacher) {
      const key = `${slot.day}-${slot.period}-${teacher.id}`;
      const existing = teacherTimeMap.get(key);
      if (existing && existing.classId !== slot.classId) {
        const otherClass = classLookup.get(existing.classId)?.name || 'Kelas lain';
        conflicts.push({
          type: 'TEACHER_DOUBLE_BOOKING',
          description: `Guru ${teacher.name} bentrok pada hari ${slot.day} Jam ke-${slot.period} di ${classItem?.name || 'Kelas'} dan ${otherClass}`,
          day: slot.day,
          period: slot.period,
          teacherId: teacher.id
        });
      } else {
        teacherTimeMap.set(key, slot);
      }

      // Check if teacher is scheduled on an unavailable day
      if (teacher.unavailableDays && teacher.unavailableDays.includes(slot.day)) {
        const hasUnavConflict = conflicts.some(
          c => c.type === 'TEACHER_UNAVAILABLE' && c.teacherId === teacher.id && c.day === slot.day && c.period === slot.period
        );
        if (!hasUnavConflict) {
          conflicts.push({
            type: 'TEACHER_UNAVAILABLE',
            description: `Guru ${teacher.name} dijadwalkan pada hari ${slot.day} Jam ke-${slot.period} padahal mengajukan Libur/Off`,
            day: slot.day,
            period: slot.period,
            teacherId: teacher.id,
            classId: slot.classId
          });
        }
      }

      // Check if teacher preferred days is set and scheduled day is not in preferredDays
      if (teacher.preferredDays && teacher.preferredDays.length > 0 && !teacher.preferredDays.includes(slot.day)) {
        const hasPrefConflict = conflicts.some(
          c => c.type === 'TEACHER_PREFERRED_MISMATCH' && c.teacherId === teacher.id && c.day === slot.day && c.period === slot.period
        );
        if (!hasPrefConflict) {
          conflicts.push({
            type: 'TEACHER_PREFERRED_MISMATCH',
            description: `Guru ${teacher.name} dijadwalkan pada hari ${slot.day} Jam ke-${slot.period} (Bukan hari pilihan mengajar: ${teacher.preferredDays.join(', ')})`,
            day: slot.day,
            period: slot.period,
            teacherId: teacher.id,
            classId: slot.classId
          });
        }
      }
    }

    // Check class double booking
    if (classItem) {
      const key = `${slot.day}-${slot.period}-${classItem.id}`;
      const existing = classTimeMap.get(key);
      if (existing && existing.assignmentId !== slot.assignmentId) {
        const otherAssignment = assignmentLookup.get(existing.assignmentId);
        if (otherAssignment && otherAssignment.subjectId !== assignment.subjectId) {
          conflicts.push({
            type: 'CLASS_DOUBLE_BOOKING',
            description: `Kelas ${classItem.name} terisi dua mata pelajaran berbeda pada hari ${slot.day} Jam ke-${slot.period}`,
            day: slot.day,
            period: slot.period,
            classId: classItem.id
          });
        }
      } else {
        classTimeMap.set(key, slot);
      }
    }
  }

  // Check over hours compared to workload assignment
  for (const [assignmentId, hours] of hoursCount.entries()) {
    const assignment = assignmentLookup.get(assignmentId);
    if (assignment && hours > assignment.hoursPerWeek) {
      const cls = classLookup.get(assignment.classId)?.name || 'Kelas';
      const teacher = teacherLookup.get(assignment.teacherId)?.name || 'Guru';
      conflicts.push({
        type: 'OVER_HOURS',
        description: `Alokasi jam mata pelajaran melebihi kapasitas beban (${hours}/${assignment.hoursPerWeek} JP) untuk ${teacher} di ${cls}`,
        classId: assignment.classId,
        teacherId: assignment.teacherId
      });
    }
  }

  return conflicts;
}

/**
 * Automatically builds a schedule using a greedy/backtracking approach that prevents conflicts
 */
export function solveSchedule(
  assignments: Assignment[],
  classes: ClassItem[],
  days: string[],
  timeSlots: TimeSlot[],
  teachers: Teacher[] = []
): ScheduleSlot[] {
  const resultSlots: ScheduleSlot[] = [];
  const activePeriods = timeSlots.filter(t => !t.isBreak).map(t => t.period);
  
  if (assignments.length === 0 || classes.length === 0 || days.length === 0 || activePeriods.length === 0) {
    return [];
  }

  const teacherLookup = new Map(teachers.map(t => [t.id, t]));

  // Copy and shuffle assignments to introduce variety and ease scheduling
  const assignmentPool = [...assignments].sort((a, b) => b.hoursPerWeek - a.hoursPerWeek); // Sort descending to place larger chunks first

  // Setup grid state
  // Track booked teachers: day-period-teacherId -> boolean
  const teacherBookings = new Set<string>();
  // Track booked classes: day-period-classId -> assignmentId
  const classBookings = new Map<string, string>();

  // Helper functions
  const isTeacherAvailable = (teacherId: string, day: string, period: number) => {
    // Check if teacher is double booked
    if (teacherBookings.has(`${day}-${period}-${teacherId}`)) {
      return false;
    }
    // Check if day is marked as unavailable/request off
    const teacher = teacherLookup.get(teacherId);
    if (teacher && teacher.unavailableDays && teacher.unavailableDays.includes(day)) {
      return false;
    }
    return true;
  };

  const isClassAvailable = (classId: string, day: string, period: number) => {
    return !classBookings.has(`${day}-${period}-${classId}`);
  };

  const bookSlot = (teacherId: string, classId: string, day: string, period: number, assignmentId: string) => {
    teacherBookings.add(`${day}-${period}-${teacherId}`);
    classBookings.set(`${day}-${period}-${classId}`, assignmentId);
    resultSlots.push({
      classId,
      day,
      period,
      assignmentId
    });
  };

  // Helper to determine allowed split configurations for a given hours per week
  const getBlockSplits = (hours: number): number[][] => {
    if (hours <= 0) return [[]];
    if (hours === 1) return [[1]];
    if (hours === 2) return [[2]];
    if (hours === 3) return [[3]];
    if (hours === 4) return [[2, 2], [4]];
    if (hours === 5) return [[3, 2], [5]];
    if (hours === 6) return [[3, 3], [4, 2], [2, 2, 2], [6]];
    if (hours === 7) return [[4, 3], [3, 2, 2], [5, 2], [7]];
    if (hours === 8) return [[4, 4], [4, 2, 2], [3, 3, 2], [2, 2, 2, 2], [8]];

    // Generic partition for hours > 8 with parts >= 2
    const results: number[][] = [];
    const partition = (n: number, max: number, current: number[]) => {
      if (n === 0) {
        results.push(current);
        return;
      }
      const start = Math.min(n, max);
      for (let i = start; i >= 2; i--) {
        partition(n - i, i, [...current, i]);
      }
    };
    partition(hours, hours, []);
    return results.sort((a, b) => a.length - b.length);
  };

  // We want to group teaching hours together where possible (blocks of 2-4 JP are normal for schools)
  // Let's iterate through each assignment, and allocate its required JP
  for (const assign of assignmentPool) {
    // Sort days to prioritize teacher's preferredDays first
    const teacher = teacherLookup.get(assign.teacherId);
    const prefDays = teacher?.preferredDays || [];
    const sortedDays = [...days].sort((a, b) => {
      const aPref = prefDays.includes(a);
      const bPref = prefDays.includes(b);
      if (aPref && !bPref) return -1;
      if (!aPref && bPref) return 1;
      return 0;
    });

    const possibleSplits = getBlockSplits(assign.hoursPerWeek);
    let successfullyScheduled = false;

    // Try each valid split configuration
    for (const split of possibleSplits) {
      if (successfullyScheduled) break;

      // Search for a placement of this split on distinct days
      const tryScheduleSplit = (
        splitParts: number[]
      ): { day: string; periods: number[] }[] | null => {
        const placements: { day: string; periods: number[] }[] = [];
        const usedDays = new Set<string>();

        function search(partIndex: number): boolean {
          if (partIndex === splitParts.length) {
            return true;
          }

          const blockSize = splitParts[partIndex];

          for (const day of sortedDays) {
            if (usedDays.has(day)) continue;

            // Find consecutive slots of size `blockSize` on this day
            for (let i = 0; i <= activePeriods.length - blockSize; i++) {
              const candidatePeriods = activePeriods.slice(i, i + blockSize);
              
              // Verify periods are continuous sequential numbers
              let isConsecutive = true;
              for (let j = 0; j < candidatePeriods.length - 1; j++) {
                if (candidatePeriods[j + 1] !== candidatePeriods[j] + 1) {
                  isConsecutive = false;
                  break;
                }
              }
              if (!isConsecutive) continue;

              let isBlockFeasible = true;
              for (const p of candidatePeriods) {
                if (!isTeacherAvailable(assign.teacherId, day, p) || !isClassAvailable(assign.classId, day, p)) {
                  isBlockFeasible = false;
                  break;
                }
              }

              if (isBlockFeasible) {
                // Temporary book
                placements.push({ day, periods: candidatePeriods });
                usedDays.add(day);
                
                for (const p of candidatePeriods) {
                  teacherBookings.add(`${day}-${p}-${assign.teacherId}`);
                  classBookings.set(`${day}-${p}-${assign.classId}`, assign.id);
                }

                if (search(partIndex + 1)) {
                  return true;
                }

                // Backtrack
                for (const p of candidatePeriods) {
                  teacherBookings.delete(`${day}-${p}-${assign.teacherId}`);
                  classBookings.delete(`${day}-${p}-${assign.classId}`);
                }
                usedDays.delete(day);
                placements.pop();
              }
            }
          }

          return false;
        }

        if (search(0)) {
          return placements;
        }
        return null;
      };

      const placements = tryScheduleSplit(split);
      if (placements) {
        for (const placement of placements) {
          for (const p of placement.periods) {
            resultSlots.push({
              classId: assign.classId,
              day: placement.day,
              period: p,
              assignmentId: assign.id
            });
          }
        }
        successfullyScheduled = true;
      }
    }

    // Fallback: If all preferred splits fail (highly congested schedule),
    // schedule the remaining hours using any available slots (individual hours)
    if (!successfullyScheduled) {
      let remainingHours = assign.hoursPerWeek;
      
      // Try to place blocks of 2 if possible first, then 1
      const fallbackBlockSizes = [2, 1];
      for (const blockSize of fallbackBlockSizes) {
        if (remainingHours <= 0) break;
        
        const currentBlock = Math.min(blockSize, remainingHours);
        let placedBlock = false;
        
        for (const day of sortedDays) {
          if (placedBlock) break;
          
          for (let i = 0; i <= activePeriods.length - currentBlock; i++) {
            const candidatePeriods = activePeriods.slice(i, i + currentBlock);
            
            let isConsecutive = true;
            for (let j = 0; j < candidatePeriods.length - 1; j++) {
              if (candidatePeriods[j + 1] !== candidatePeriods[j] + 1) {
                isConsecutive = false;
                break;
              }
            }
            if (!isConsecutive) continue;

            let isBlockFeasible = true;
            for (const p of candidatePeriods) {
              if (!isTeacherAvailable(assign.teacherId, day, p) || !isClassAvailable(assign.classId, day, p)) {
                isBlockFeasible = false;
                break;
              }
            }
            
            if (isBlockFeasible) {
              for (const p of candidatePeriods) {
                bookSlot(assign.teacherId, assign.classId, day, p, assign.id);
              }
              remainingHours -= currentBlock;
              placedBlock = true;
              break;
            }
          }
        }
      }

      // Individual fallback for any absolute leftovers
      if (remainingHours > 0) {
        for (const day of sortedDays) {
          if (remainingHours <= 0) break;
          for (const p of activePeriods) {
            if (remainingHours <= 0) break;
            if (isTeacherAvailable(assign.teacherId, day, p) && isClassAvailable(assign.classId, day, p)) {
              bookSlot(assign.teacherId, assign.classId, day, p, assign.id);
              remainingHours--;
            }
          }
        }
      }
    }
  }

  // Pre-fill all empty active slots in the schedule with empty strings so they are represented
  for (const cls of classes) {
    for (const day of days) {
      for (const p of activePeriods) {
        const alreadyBooked = resultSlots.some(s => s.classId === cls.id && s.day === day && s.period === p);
        if (!alreadyBooked) {
          resultSlots.push({
            classId: cls.id,
            day,
            period: p,
            assignmentId: ""
          });
        }
      }
    }
  }

  return resultSlots;
}
