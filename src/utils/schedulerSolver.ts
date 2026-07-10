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
  timeSlots: TimeSlot[]
): ScheduleSlot[] {
  const resultSlots: ScheduleSlot[] = [];
  const activePeriods = timeSlots.filter(t => !t.isBreak).map(t => t.period);
  
  if (assignments.length === 0 || classes.length === 0 || days.length === 0 || activePeriods.length === 0) {
    return [];
  }

  // Copy and shuffle assignments to introduce variety and ease scheduling
  const assignmentPool = [...assignments].sort((a, b) => b.hoursPerWeek - a.hoursPerWeek); // Sort descending to place larger chunks first

  // Setup grid state
  // Track booked teachers: day-period-teacherId -> boolean
  const teacherBookings = new Set<string>();
  // Track booked classes: day-period-classId -> assignmentId
  const classBookings = new Map<string, string>();

  // Helper functions
  const isTeacherAvailable = (teacherId: string, day: string, period: number) => {
    return !teacherBookings.has(`${day}-${period}-${teacherId}`);
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

  // We want to group teaching hours together where possible (blocks of 2-4 JP are normal for schools)
  // Let's iterate through each assignment, and allocate its required JP
  for (const assign of assignmentPool) {
    let remainingHours = assign.hoursPerWeek;
    
    // Find consecutive slots in a single day or across days
    // Standard block sizes: try block of 3 or 2, fallback to 1
    const targetBlockSizes = [3, 2, 1];
    
    // Find options for placing this assignment
    for (const blockSize of targetBlockSizes) {
      if (remainingHours <= 0) break;
      
      const currentBlock = Math.min(blockSize, remainingHours);
      
      // Look for a day and starting period that can accommodate the block
      let placedBlock = false;
      
      for (const day of days) {
        if (placedBlock) break;
        
        // Loop through period slots
        for (let i = 0; i <= activePeriods.length - currentBlock; i++) {
          const candidatePeriods = activePeriods.slice(i, i + currentBlock);
          
          // Verify if teacher and class are free for ALL candidate periods in the block
          let isBlockFeasible = true;
          for (const p of candidatePeriods) {
            if (!isTeacherAvailable(assign.teacherId, day, p) || !isClassAvailable(assign.classId, day, p)) {
              isBlockFeasible = false;
              break;
            }
          }
          
          if (isBlockFeasible) {
            // Allocate the block!
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

    // Fallback: If still has remaining hours and couldn't schedule in clean blocks, place them individually anywhere
    if (remainingHours > 0) {
      for (const day of days) {
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
