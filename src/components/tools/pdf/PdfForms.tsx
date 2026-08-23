import React, { useState } from 'react';
import { Download, Edit3 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PDFDocument, PDFTextField, PDFCheckBox, PDFDropdown, PDFRadioGroup } from 'pdf-lib';
import { FileUploader } from '../../common/FileUploader';
import { PostCompletionRecommendations } from '../../common/RelatedTools';
import { showToast } from '../../common/Toast';
import { downloadBlob, readFileAsArrayBuffer } from '../../../utils/fileUtils';

interface FormFieldInfo {
  name: string;
  type: string;
  value: string | boolean;
  options?: string[];
}

export const PdfForms: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fields, setFields] = useState<FormFieldInfo[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      try {
        const buffer = await readFileAsArrayBuffer(files[0]);
        const pdfDoc = await PDFDocument.load(new Uint8Array(buffer), { ignoreEncryption: true });
        const form = pdfDoc.getForm();
        const pdfFields = form.getFields();

        const extractedFields: FormFieldInfo[] = [];
        const initialData: Record<string, any> = {};

        pdfFields.forEach(field => {
          const name = field.getName();
          if (field instanceof PDFTextField) {
            extractedFields.push({ name, type: 'text', value: field.getText() || '' });
            initialData[name] = field.getText() || '';
          } else if (field instanceof PDFCheckBox) {
            extractedFields.push({ name, type: 'checkbox', value: field.isChecked() });
            initialData[name] = field.isChecked();
          } else if (field instanceof PDFDropdown) {
            extractedFields.push({ name, type: 'dropdown', value: field.getSelected()[0] || '', options: field.getOptions() });
            initialData[name] = field.getSelected()[0] || '';
          } else if (field instanceof PDFRadioGroup) {
             extractedFields.push({ name, type: 'radio', value: field.getSelected() || '', options: field.getOptions() });
             initialData[name] = field.getSelected() || '';
          }
        });

        setFields(extractedFields);
        setFormData(initialData);

        if (extractedFields.length === 0) {
          showToast({ type: 'info', title: 'No Form Fields', message: 'No interactive form fields found in this PDF.' });
        }
      } catch (err) {
        showToast({ type: 'error', title: 'Error', message: 'Failed to read PDF form fields.' });
      }
    }
  };

  const handleApply = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const buffer = await readFileAsArrayBuffer(file);
      const pdfDoc = await PDFDocument.load(new Uint8Array(buffer), { ignoreEncryption: true });
      const form = pdfDoc.getForm();

      fields.forEach(fieldInfo => {
        const field = form.getField(fieldInfo.name);
        const val = formData[fieldInfo.name];
        
        if (field instanceof PDFTextField && typeof val === 'string') {
          field.setText(val);
        } else if (field instanceof PDFCheckBox && typeof val === 'boolean') {
          if (val) field.check();
          else field.uncheck();
        } else if (field instanceof PDFDropdown && typeof val === 'string' && val) {
          field.select(val);
        } else if (field instanceof PDFRadioGroup && typeof val === 'string' && val) {
          field.select(val);
        }
      });

      form.flatten(); // Permanent embed

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, `filled-${file.name}`);
      confetti();
      showToast({ type: 'success', title: 'Success', message: 'Form filled and flattened successfully' });
    } catch (err) {
      showToast({ type: 'error', title: 'Error', message: 'Failed to fill PDF form.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setFields([]);
    setFormData({});
  };

  if (!file) {
    return (
      <FileUploader
        accept="application/pdf"
        allowedFormatsText="PDF"
        label="Drop Form PDF here"
        description="Fill interactive PDF forms and flatten them."
        onFilesSelected={handleFilesSelected}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border shadow-sm">
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Edit3 className="text-indigo-600" /> Form Fields ({fields.length})
        </h3>

        {fields.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No editable form fields found in this document.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map(field => (
              <div key={field.name} className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {field.name}
                </label>
                
                {field.type === 'text' && (
                  <input
                    type="text"
                    value={formData[field.name]}
                    onChange={e => setFormData({...formData, [field.name]: e.target.value})}
                    className="border p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-900"
                  />
                )}

                {field.type === 'checkbox' && (
                  <input
                    type="checkbox"
                    checked={formData[field.name]}
                    onChange={e => setFormData({...formData, [field.name]: e.target.checked})}
                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                )}

                {field.type === 'dropdown' && (
                  <select
                    value={formData[field.name]}
                    onChange={e => setFormData({...formData, [field.name]: e.target.value})}
                    className="border p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-900"
                  >
                    <option value="">Select option...</option>
                    {field.options?.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}

                {field.type === 'radio' && (
                  <select
                    value={formData[field.name]}
                    onChange={e => setFormData({...formData, [field.name]: e.target.value})}
                    className="border p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-900"
                  >
                    <option value="">Select option...</option>
                    {field.options?.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <button onClick={handleReset} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
        <button 
          onClick={handleApply} 
          disabled={isProcessing || fields.length === 0} 
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50"
        >
          <Download size={18} /> Fill & Flatten
        </button>
      </div>
      
      <PostCompletionRecommendations currentToolId="pdf-forms" onReset={handleReset} />
    </div>
  );
};
