'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, LoadingSpinner } from '../../components';
import { detectFileType } from '../../utils/parsers';

type ImportType = 'exercise' | 'workout';

interface ImportResult {
  success: boolean;
  summary?: {
    total: number;
    imported: number;
    skipped?: number;
    errors: number;
  };
  imported?: any[];
  skipped?: string[];
  errors?: string[];
}

export default function ImportPage() {
  const router = useRouter();
  const [importType, setImportType] = useState<ImportType>('exercise');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileType = detectFileType(file.name);
      if (!fileType) {
        setError('Unsupported file type. Please select a CSV, JSON, or XML file.');
        setSelectedFile(null);
      } else {
        setError(null);
        setSelectedFile(file);
        setResult(null);
      }
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setImporting(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      if (importType === 'workout') {
        // For now, use a default user ID - in a real app, this would come from authentication
        formData.append('userId', 'default-user-id');
      }

      const response = await fetch(`/api/import/${importType}s`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Import failed');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during import');
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Import Data</h1>

        {/* Import Type Selection */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">What would you like to import?</h2>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="exercise"
                checked={importType === 'exercise'}
                onChange={(e) => setImportType(e.target.value as ImportType)}
                className="mr-2"
              />
              <span>Exercises</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="workout"
                checked={importType === 'workout'}
                onChange={(e) => setImportType(e.target.value as ImportType)}
                className="mr-2"
              />
              <span>Workouts</span>
            </label>
          </div>
        </Card>

        {/* File Upload */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Select File</h2>
          <div className="space-y-4">
            <div>
              <input
                type="file"
                accept=".csv,.json,.xml"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>

            {selectedFile && (
              <div className="text-sm text-gray-600">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
              </div>
            )}

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
          </div>
        </Card>

        {/* File Format Help */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">File Format Guidelines</h2>
          <div className="space-y-4 text-sm">
            {importType === 'exercise' ? (
              <div>
                <h3 className="font-semibold mb-2">Exercise Import Format:</h3>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="font-semibold mb-1">CSV Format:</p>
                  <code className="text-xs">
                    name,category,muscleGroup,notes<br/>
                    Bench Press,strength,"chest,triceps,shoulders",Classic chest exercise<br/>
                    Running,cardio,full body,Great for cardio
                  </code>
                </div>
                <div className="bg-gray-50 p-3 rounded mt-2">
                  <p className="font-semibold mb-1">JSON Format:</p>
                  <code className="text-xs">
                    {`[
  {
    "name": "Bench Press",
    "category": "strength",
    "muscleGroup": ["chest", "triceps", "shoulders"],
    "notes": "Classic chest exercise"
  }
]`}
                  </code>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-semibold mb-2">Workout Import Format:</h3>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="font-semibold mb-1">CSV Format:</p>
                  <code className="text-xs">
                    workout,date,exercise,set,reps,weight,duration,distance,notes<br/>
                    Morning Workout,2024-01-15,Bench Press,1,10,135,,,"Good form"<br/>
                    Morning Workout,2024-01-15,Bench Press,2,8,145,,,"Felt heavy"
                  </code>
                </div>
                <div className="bg-gray-50 p-3 rounded mt-2">
                  <p className="font-semibold mb-1">JSON Format:</p>
                  <code className="text-xs">
                    {`[
  {
    "name": "Morning Workout",
    "date": "2024-01-15",
    "exercises": [
      {
        "exerciseName": "Bench Press",
        "sets": [
          { "setNumber": 1, "reps": 10, "weight": 135 }
        ]
      }
    ]
  }
]`}
                  </code>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Import Button */}
        <div className="flex gap-4 mb-6">
          <Button
            onClick={handleImport}
            disabled={!selectedFile || importing}
            className="flex-1"
          >
            {importing ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Importing...
              </>
            ) : (
              'Import'
            )}
          </Button>
          {result && (
            <Button
              onClick={handleReset}
              variant="secondary"
            >
              Import Another File
            </Button>
          )}
        </div>

        {/* Import Results */}
        {result && (
          <Card>
            <h2 className="text-xl font-semibold mb-4">Import Results</h2>
            
            {result.success ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">Import Successful!</h3>
                  <div className="text-sm text-green-700">
                    <p>Total items: {result.summary?.total || 0}</p>
                    <p>Successfully imported: {result.summary?.imported || 0}</p>
                    {result.summary?.skipped !== undefined && (
                      <p>Skipped (already exists): {result.summary.skipped}</p>
                    )}
                    {result.summary?.errors !== undefined && result.summary.errors > 0 && (
                      <p>Errors: {result.summary.errors}</p>
                    )}
                  </div>
                </div>

                {result.skipped && result.skipped.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-800 mb-2">Skipped Items</h3>
                    <ul className="text-sm text-yellow-700 list-disc list-inside">
                      {result.skipped.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.errors && result.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="font-semibold text-red-800 mb-2">Errors</h3>
                    <ul className="text-sm text-red-700 list-disc list-inside">
                      {result.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-4 mt-4">
                  <Button
                    onClick={() => router.push(importType === 'exercise' ? '/exercises' : '/workouts')}
                    variant="primary"
                  >
                    View {importType === 'exercise' ? 'Exercises' : 'Workouts'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2">Import Failed</h3>
                {result.errors && (
                  <ul className="text-sm text-red-700 list-disc list-inside">
                    {result.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}