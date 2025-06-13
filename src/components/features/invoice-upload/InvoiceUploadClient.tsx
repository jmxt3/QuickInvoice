'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { extractInvoiceData } from '@/ai/flows/extract-invoice-data';
import { addInvoice, updateInvoice } from '@/lib/invoice-store';
import type { StoredInvoice } from '@/types/invoice';
import { FileUp, Loader2 } from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

const formSchema = z.object({
  files: z
    .custom<FileList>((val) => val instanceof FileList && val.length > 0, 'At least one file is required.')
    .refine((files) => Array.from(files).every((file) => file.size <= MAX_FILE_SIZE), `Max file size is 5MB.`)
    .refine(
      (files) => Array.from(files).every((file) => ALLOWED_FILE_TYPES.includes(file.type)),
      'Only .pdf, .jpg, .png, .webp files are accepted.'
    ),
});

type UploadFormValues = z.infer<typeof formSchema>;

interface FileStatus {
  id: string;
  name: string;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  message?: string;
}

export function InvoiceUploadClient() {
  const [fileStatuses, setFileStatuses] = useState<FileStatus[]>([]);
  const [isSubmittingOverall, setIsSubmittingOverall] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      files: undefined,
    },
  });

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const processFile = async (file: File, tempId: string): Promise<void> => {
    setFileStatuses((prev) => prev.map(fs => fs.id === tempId ? { ...fs, status: 'uploading', progress: 25 } : fs));
    
    let dataUri;
    try {
      dataUri = await readFileAsDataURL(file);
    } catch (error) {
      console.error('Error reading file:', error);
      updateInvoice({
        id: tempId,
        fileName: file.name,
        uploadDate: new Date().toISOString(),
        status: 'Error',
        errorMessage: 'Failed to read file.',
      });
      setFileStatuses((prev) => prev.map(fs => fs.id === tempId ? { ...fs, status: 'error', message: 'Failed to read file.', progress: 100 } : fs));
      return;
    }

    setFileStatuses((prev) => prev.map(fs => fs.id === tempId ? { ...fs, status: 'processing', progress: 50 } : fs));

    try {
      const extractedData = await extractInvoiceData({ invoiceDataUri: dataUri });
      updateInvoice({
        id: tempId,
        fileName: file.name,
        uploadDate: new Date().toISOString(),
        status: 'Completed',
        extractedData,
      });
      setFileStatuses((prev) => prev.map(fs => fs.id === tempId ? { ...fs, status: 'completed', progress: 100 } : fs));
    } catch (aiError) {
      console.error('AI processing error:', aiError);
      updateInvoice({
        id: tempId,
        fileName: file.name,
        uploadDate: new Date().toISOString(),
        status: 'Error',
        errorMessage: 'AI processing failed. ' + (aiError instanceof Error ? aiError.message : String(aiError)),
      });
      setFileStatuses((prev) => prev.map(fs => fs.id === tempId ? { ...fs, status: 'error', message: 'AI processing failed.', progress: 100 } : fs));
    }
  };


  const onSubmit: SubmitHandler<UploadFormValues> = async (data) => {
    setIsSubmittingOverall(true);
    const filesToProcess = Array.from(data.files);
    
    const initialFileStatuses = filesToProcess.map(file => {
      const tempId = uuidv4(); // Use uuid here
      const initialInvoice: StoredInvoice = {
        id: tempId,
        fileName: file.name,
        uploadDate: new Date().toISOString(),
        status: 'Pending',
      };
      addInvoice(initialInvoice);
      return { id: tempId, name: file.name, status: 'pending' as const, progress: 0 };
    });
    setFileStatuses(initialFileStatuses);

    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      const fileStatus = initialFileStatuses[i];
      await processFile(file, fileStatus.id);
    }

    setIsSubmittingOverall(false);
    toast({
      title: 'Processing Complete',
      description: 'All selected files have been processed. Check dashboard for status.',
    });
    form.reset(); 
    router.push('/dashboard');
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="files"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Invoice Files</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  multiple
                  accept={ALLOWED_FILE_TYPES.join(',')}
                  onChange={(e) => field.onChange(e.target.files)}
                  className="pt-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {fileStatuses.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Upload Progress</h3>
            {fileStatuses.map((fs) => (
              <div key={fs.id} className="p-3 border rounded-md">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-medium truncate max-w-[70%]">{fs.name}</p>
                  <p className={`text-sm font-semibold ${fs.status === 'error' ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {fs.status.charAt(0).toUpperCase() + fs.status.slice(1)}
                  </p>
                </div>
                <Progress value={fs.progress} className="h-2" />
                {fs.message && <p className={`text-xs mt-1 ${fs.status === 'error' ? 'text-destructive' : 'text-muted-foreground'}`}>{fs.message}</p>}
              </div>
            ))}
          </div>
        )}

        <Button type="submit" disabled={isSubmittingOverall} className="w-full sm:w-auto">
          {isSubmittingOverall ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FileUp className="mr-2 h-4 w-4" />
          )}
          Upload and Process
        </Button>
      </form>
    </Form>
  );
}
