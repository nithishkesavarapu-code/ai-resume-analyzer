import {useState, useCallback} from 'react'
import { formatSize } from '../lib/utils'

interface FileUploaderProps {
    onFileSelect?: (file: File | null) => void;
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
    const [isDragActive, setIsDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const handleFile = (selectedFile: File) => {
        if (selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            onFileSelect?.(selectedFile);
        } else {
            alert('Please upload a PDF file');
        }
    };

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            handleFile(droppedFile);
        }
    }, [onFileSelect]);

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(false);
    }, []);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            handleFile(selectedFile);
        }
    };

    const maxFileSize = 20 * 1024 * 1024; // 20MB in bytes

    return (
        <div 
            className={`w-full gradient-border ${isDragActive ? 'border-blue-500 bg-blue-50' : ''}`}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
        >
            <div className="relative">
                <input 
                    type="file" 
                    accept=".pdf" 
                    onChange={onFileChange} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="uploader-input"
                />

                <div className="space-y-4 py-8">
                    {file ? (
                        <div className="uploader-selected-file" onClick={(e) => e.stopPropagation()}>
                            <div className="flex flex-row items-center gap-4">
                                <img src="/images/pdf.png" alt="pdf" className="size-10" />
                                <div className="flex flex-col">
                                    <p className="text-sm font-medium text-gray-700 truncate max-w-xs">
                                        {file.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {formatSize(file.size)}
                                    </p>
                                </div>
                            </div>
                            <button className="p-2 cursor-pointer relative z-10" onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setFile(null);
                                onFileSelect?.(null);
                            }}>
                                <img src="/icons/cross.svg" alt="remove" className="w-4 h-4 ml-auto" />
                            </button>
                        </div>
                    ): (
                        <div className="text-center pointer-events-none">
                            <div className="mx-auto w-16 h-16 flex items-center justify-center mb-2">
                                <img src="/icons/info.svg" alt="upload" className="size-20" />
                            </div>
                            <p className="text-lg text-gray-500">
                                <span className="font-semibold">
                                    Click to upload
                                </span> or drag and drop
                            </p>
                            <p className="text-lg text-gray-500">PDF (max {formatSize(maxFileSize)})</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
export default FileUploader
