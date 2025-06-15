'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit2, Save, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface Exercise {
  id: string;
  name: string;
  category: string;
  muscleGroups: string[];
  equipment: string;
  difficulty: string;
  instructions: string;
  createdAt: string;
  updatedAt: string;
}

interface ExerciseHistory {
  id: string;
  date: string;
  sets: number;
  reps: number;
  weight: number;
  notes?: string;
}

const muscleGroups = [
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Legs',
  'Core',
  'Glutes',
];

const categories = ['Strength', 'Cardio', 'Flexibility', 'Balance'];

const equipmentOptions = [
  'None',
  'Barbell',
  'Dumbbell',
  'Machine',
  'Cable',
  'Bodyweight',
  'Resistance Band',
  'Kettlebell',
];

const difficultyLevels = ['Beginner', 'Intermediate', 'Advanced'];

export default function ExercisePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [history, setHistory] = useState<ExerciseHistory[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedExercise, setEditedExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExerciseData();
  }, [params.id]);

  const fetchExerciseData = async () => {
    try {
      // Fetch exercise details
      const exerciseRes = await fetch(`/api/exercises/${params.id}`);
      if (!exerciseRes.ok) throw new Error('Failed to fetch exercise');
      const exerciseData = await exerciseRes.json();
      setExercise(exerciseData);
      setEditedExercise(exerciseData);

      // Fetch exercise history
      const historyRes = await fetch(`/api/exercises/${params.id}/history`);
      if (!historyRes.ok) throw new Error('Failed to fetch history');
      const historyData = await historyRes.json();
      setHistory(historyData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editedExercise) return;

    try {
      const res = await fetch(`/api/exercises/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedExercise),
      });

      if (!res.ok) throw new Error('Failed to update exercise');

      const updated = await res.json();
      setExercise(updated);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating exercise:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/exercises/${params.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete exercise');

      router.push('/exercises');
    } catch (error) {
      console.error('Error deleting exercise:', error);
    }
  };

  const handleCancel = () => {
    setEditedExercise(exercise);
    setIsEditing(false);
  };

  const toggleMuscleGroup = (muscle: string) => {
    if (!editedExercise) return;
    
    const updated = editedExercise.muscleGroups.includes(muscle)
      ? editedExercise.muscleGroups.filter(m => m !== muscle)
      : [...editedExercise.muscleGroups, muscle];
    
    setEditedExercise({ ...editedExercise, muscleGroups: updated });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!exercise || !editedExercise) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Exercise not found</h2>
          <Button 
            onClick={() => router.push('/exercises')}
            className="mt-4"
          >
            Back to Exercises
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/exercises')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Exercise</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this exercise? This will also delete all associated workout history.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            ) : (
              <>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </>
            )}
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Exercise Details</CardTitle>
            <CardDescription>
              {isEditing ? 'Edit exercise information' : 'View exercise information'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={editedExercise.name}
                  onChange={(e) => setEditedExercise({ ...editedExercise, name: e.target.value })}
                />
              ) : (
                <p className="text-lg font-medium">{exercise.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              {isEditing ? (
                <Select
                  value={editedExercise.category}
                  onValueChange={(value) => setEditedExercise({ ...editedExercise, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-lg">{exercise.category}</p>
              )}
            </div>

            <div>
              <Label>Muscle Groups</Label>
              {isEditing ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {muscleGroups.map(muscle => (
                    <Badge
                      key={muscle}
                      variant={editedExercise.muscleGroups.includes(muscle) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleMuscleGroup(muscle)}
                    >
                      {muscle}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mt-2">
                  {exercise.muscleGroups.map(muscle => (
                    <Badge key={muscle}>{muscle}</Badge>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="equipment">Equipment</Label>
              {isEditing ? (
                <Select
                  value={editedExercise.equipment}
                  onValueChange={(value) => setEditedExercise({ ...editedExercise, equipment: value })}
                >
                  <SelectTrigger id="equipment">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {equipmentOptions.map(equip => (
                      <SelectItem key={equip} value={equip}>{equip}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-lg">{exercise.equipment}</p>
              )}
            </div>

            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              {isEditing ? (
                <Select
                  value={editedExercise.difficulty}
                  onValueChange={(value) => setEditedExercise({ ...editedExercise, difficulty: value })}
                >
                  <SelectTrigger id="difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {difficultyLevels.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant={
                  exercise.difficulty === 'Beginner' ? 'secondary' :
                  exercise.difficulty === 'Intermediate' ? 'default' :
                  'destructive'
                }>
                  {exercise.difficulty}
                </Badge>
              )}
            </div>

            <div>
              <Label htmlFor="instructions">Instructions</Label>
              {isEditing ? (
                <textarea
                  id="instructions"
                  className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                  value={editedExercise.instructions}
                  onChange={(e) => setEditedExercise({ ...editedExercise, instructions: e.target.value })}
                />
              ) : (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {exercise.instructions}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <span className="font-medium">Created:</span> {format(new Date(exercise.createdAt), 'PPP')}
              </div>
              <div>
                <span className="font-medium">Updated:</span> {format(new Date(exercise.updatedAt), 'PPP')}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workout History</CardTitle>
            <CardDescription>
              Recent performance with this exercise
            </CardDescription>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No workout history yet
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Sets</TableHead>
                    <TableHead>Reps</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        {format(new Date(record.date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>{record.sets}</TableCell>
                      <TableCell>{record.reps}</TableCell>
                      <TableCell>{record.weight} lbs</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {record.notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}