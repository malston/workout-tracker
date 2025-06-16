# Sample Import Files

This directory contains sample files for testing the import functionality of the Workout Tracker application.

## File Types Supported

- **CSV** - Comma-separated values
- **JSON** - JavaScript Object Notation
- **XML** - Extensible Markup Language

## Exercise Import Formats

### CSV Format
```csv
name,category,muscleGroup,notes
Bench Press,strength,"chest,triceps,shoulders",Classic chest exercise
```

Required fields:
- `name` - Exercise name (unique)
- `category` - One of: strength, cardio, flexibility, balance, sports, other
- `muscleGroup` - Comma-separated list of muscle groups

Optional fields:
- `notes` - Additional notes about the exercise

### JSON Format
```json
[
  {
    "name": "Bench Press",
    "category": "strength",
    "muscleGroup": ["chest", "triceps", "shoulders"],
    "notes": "Classic chest exercise"
  }
]
```

### XML Format
```xml
<exercises>
  <exercise>
    <name>Bench Press</name>
    <category>strength</category>
    <muscleGroup>
      <muscle>chest</muscle>
      <muscle>triceps</muscle>
    </muscleGroup>
    <notes>Classic chest exercise</notes>
  </exercise>
</exercises>
```

## Workout Import Formats

### CSV Format
```csv
workout,date,notes,exercise,set,reps,weight,duration,distance,set notes
Monday Chest,2024-01-15,Great workout,Bench Press,1,10,135,,,Good form
```

Required fields:
- `workout` - Workout name
- `date` - Date in YYYY-MM-DD format
- `exercise` - Exercise name
- `set` - Set number

Optional fields:
- `notes` - Workout notes
- `reps` - Number of repetitions
- `weight` - Weight in pounds
- `duration` - Duration in minutes (for cardio)
- `distance` - Distance in miles (for cardio)
- `set notes` - Notes for individual sets

### JSON Format
```json
[
  {
    "name": "Monday Upper Body",
    "date": "2024-01-15",
    "notes": "Great workout",
    "exercises": [
      {
        "exerciseName": "Bench Press",
        "order": 0,
        "sets": [
          {
            "setNumber": 1,
            "reps": 10,
            "weight": 135,
            "notes": "Warmup"
          }
        ]
      }
    ]
  }
]
```

Required fields for JSON/XML:
- `name` - Workout name
- `date` - Date in YYYY-MM-DD format
- `exerciseName` - Exercise name
- `setNumber` - Set number

Optional fields for JSON/XML:
- `status` - Workout status: "planned" or "completed" (defaults to "planned")
- `notes` - Workout notes
- `order` - Exercise order (defaults to array index if not provided)
- `reps` - Number of repetitions
- `weight` - Weight in pounds
- `duration` - Duration in minutes (for cardio)
- `distance` - Distance in miles (for cardio)
- Set `notes` - Notes for individual sets

### XML Format
```xml
<workouts>
  <workout>
    <name>Monday Upper Body</name>
    <date>2024-01-15</date>
    <notes>Great workout</notes>
    <exercises>
      <exercise>
        <exerciseName>Bench Press</exerciseName>
        <order>0</order>
        <sets>
          <set>
            <setNumber>1</setNumber>
            <reps>10</reps>
            <weight>135</weight>
          </set>
        </sets>
      </exercise>
    </exercises>
  </workout>
</workouts>
```

Note: The `<order>` element is optional in XML format - it will default to the exercise position if not provided.

## Valid Muscle Groups

- chest
- back
- shoulders
- biceps
- triceps
- forearms
- abs
- obliques
- lower back
- glutes
- quadriceps
- hamstrings
- calves
- hip flexors
- adductors
- abductors
- neck
- full body

## Valid Exercise Categories

- strength
- cardio
- flexibility
- balance
- sports
- other

## Import Notes

1. Exercise names must be unique
2. If importing workouts with exercises that don't exist, they will be auto-created with default values
3. Dates should be in ISO format (YYYY-MM-DD)
4. Muscle groups can be separated by commas, semicolons, or pipes in CSV files
5. The import process will validate all data and report any errors before importing