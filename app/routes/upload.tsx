import {type FormEvent, useState} from 'react'
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import {usePuterStore} from "~/lib/puter";
import {useNavigate} from "react-router";
import {convertPdfToImage, extractTextFromPdf} from "~/lib/pdf2img";
import {generateUUID} from "~/lib/utils";
import {prepareInstructions} from "../../constants";

const Upload = () => {
    const { auth, isLoading, fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const handleFileSelect = (file: File | null) => {
        setFile(file)
    }

    const cleanJson = (text: string) => {
        try {
            // 1. Try to find JSON inside markdown code blocks
            const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
            let cleanedText = jsonMatch ? jsonMatch[1] : text;
            
            // 2. Fallback: find the first '{' and last '}' if first attempt fails or is not JSON
            if (!jsonMatch || !cleanedText.trim().startsWith('{')) {
                const start = cleanedText.indexOf('{');
                const end = cleanedText.lastIndexOf('}');
                if (start !== -1 && end !== -1) {
                    cleanedText = cleanedText.substring(start, end + 1);
                }
            }
            
            return JSON.parse(cleanedText.trim());
        } catch (e) {
            console.error('Failed to parse JSON:', e, text);
            return null;
        }
    }

    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: { companyName: string, jobTitle: string, jobDescription: string, file: File  }) => {
        setIsProcessing(true);

        setStatusText('Starting analysis...');

        try {
            // Concurrent processing: Upload PDF, Convert to Image, and Extract Text
            const [uploadedFile, imageResult, resumeText] = await Promise.all([
                (async () => {
                    setStatusText('Uploading resume...');
                    return await fs.upload([file]);
                })(),
                (async () => {
                    setStatusText('Converting to image...');
                    return await convertPdfToImage(file);
                })(),
                (async () => {
                    setStatusText('Extracting text...');
                    return await extractTextFromPdf(file);
                })()
            ]);

            if (!uploadedFile) return setStatusText('Error: Failed to upload resume');
            if (!imageResult.file) {
                const errorMsg = imageResult.error || 'Unknown error during PDF conversion';
                console.error('PDF conversion error:', errorMsg);
                return setStatusText(`Error: ${errorMsg}`);
            }

            setStatusText('Uploading preview...');
            const uploadedImage = await fs.upload([imageResult.file]);
            if (!uploadedImage) return setStatusText('Error: Failed to upload preview');

            setStatusText('Preparing data...');
            const uuid = generateUUID();
            const data = {
                id: uuid,
                resumePath: uploadedFile.path,
                imagePath: uploadedImage.path,
                companyName, jobTitle, jobDescription,
                feedback: '',
            }
            await kv.set(`resume:${uuid}`, JSON.stringify(data));

            setStatusText('Analyzing with AI...');

            let feedback;
            try {
                feedback = await ai.feedback(
                    uploadedFile.path,
                    prepareInstructions({ jobTitle, jobDescription }),
                    resumeText // Pass extracted text for faster analysis
                )
            } catch (aiError) {
                console.error('AI feedback error:', aiError);
                return setStatusText(`Error: AI analysis failed - ${(aiError as any).message || 'Unknown error'}`);
            }
            
            if (!feedback) return setStatusText('Error: Failed to analyze resume - no response from AI');

            const feedbackContent = feedback.message.content;
            const feedbackText = typeof feedbackContent === 'string'
                ? feedbackContent
                : (feedbackContent as any)[0].text;

            const parsedFeedback = cleanJson(feedbackText);
            if (!parsedFeedback) return setStatusText('Error: Failed to parse AI feedback. The response was not valid JSON.');

            data.feedback = parsedFeedback;
            await kv.set(`resume:${uuid}`, JSON.stringify(data));
            setStatusText('Linking results...');
            console.log(data);
            navigate(`/resume/${uuid}`);
        } catch (error) {
            console.error('Analysis failed:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            setStatusText(`Error: An unexpected error occurred - ${(error as any).message || 'Check console for details'}`);
        } finally {
            // setIsProcessing(false); // We keep it true until navigation
        }
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if(!form) return;
        const formData = new FormData(form);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if(!file) return;

        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    }

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />

            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>Smart feedback for your dream job</h1>
                    {isProcessing ? (
                        <>
                            <h2>{statusText}</h2>
                            <img src="/images/resume-scan.gif" className="w-full" />
                        </>
                    ) : (
                        <h2>Drop your resume for an ATS score and improvement tips</h2>
                    )}
                    {!isProcessing && (
                        <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                            <div className="form-div">
                                <label htmlFor="company-name">Company Name</label>
                                <input type="text" name="company-name" placeholder="Company Name" id="company-name" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-title">Job Title</label>
                                <input type="text" name="job-title" placeholder="Job Title" id="job-title" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-description">Job Description</label>
                                <textarea rows={5} name="job-description" placeholder="Job Description" id="job-description" />
                            </div>

                            <div className="form-div">
                                <label htmlFor="uploader">Upload Resume</label>
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>

                            <button className="primary-button" type="submit">
                                Analyze Resume
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    )
}
export default Upload
