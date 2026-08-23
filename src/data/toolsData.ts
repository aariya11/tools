import type { ToolMeta } from '../types/tools';

export const TOOLS_DATA: ToolMeta[] = [
  // --- IMAGE TOOLS ---
  {
    id: 'image-compressor',
    name: 'Image Compressor',
    path: '/image-compressor',
    category: 'images',
    shortDescription: 'Compress JPG, PNG, and WebP images directly in your browser without sacrificing quality.',
    fullDescription: 'Reduce image file size significantly without visible quality loss. Real-time preview with side-by-side comparison, custom compression slider, and instant browser-side processing for 100% privacy.',
    icon: 'Minimize2',
    isPopular: true,
    badge: 'Popular',
    keywords: ['compress image', 'compress photo', 'reduce image size', 'shrink photo', 'jpg compressor', 'png compressor', 'webp compress', 'optimize image', 'reduce file size'],
    features: [
      { title: '100% On-Device Processing', description: 'Your photos never leave your device. All compression runs directly in your browser.' },
      { title: 'Adjustable Quality Slider', description: 'Fine-tune compression levels from 5% to 100% to find the perfect size-to-quality balance.' },
      { title: 'Interactive Before / After Preview', description: 'Compare the compressed output directly against the original with live size calculations.' },
      { title: 'Multiple Format Support', description: 'Compress JPEG, JPG, PNG, and WebP graphics with intelligent color preservation.' }
    ],
    howToSteps: [
      { title: 'Upload Image', description: 'Drag and drop or select any JPG, PNG, or WebP file from your device.' },
      { title: 'Adjust Quality', description: 'Move the compression slider to reach your target file size and resolution.' },
      { title: 'Review Savings', description: 'Inspect the live preview and verify the percentage of storage saved.' },
      { title: 'Download Compressed File', description: 'Click Download to instantly save your compressed image.' }
    ],
    faqs: [
      { question: 'Will my image be uploaded to a server?', answer: 'No. ToolBoxX uses browser Canvas and Blob APIs. All processing happens locally on your computer or phone.' },
      { question: 'What image formats can I compress?', answer: 'You can compress JPEG, JPG, PNG, and WebP images up to high-resolution sizes.' },
      { question: 'How much file size can I expect to save?', answer: 'Depending on original quality and your chosen compression level, file sizes typically drop by 40% to 85% with minimal perceptual loss.' },
      { question: 'Is there a limit on how many images I can compress?', answer: 'No! ToolBoxX is completely free with no usage limits, registrations, or watermarks.' }
    ],
    relatedToolIds: ['image-resizer', 'jpg-to-png', 'png-to-webp', 'jpg-to-pdf']
  },
  {
    id: 'image-resizer',
    name: 'Image Resizer',
    path: '/image-resizer',
    category: 'images',
    shortDescription: 'Resize images by pixels or percentage with aspect ratio lock and social media presets.',
    fullDescription: 'Quickly change image dimensions with precision. Maintain aspect ratios, pick from ready-to-use social media presets (Instagram, YouTube, HD, 4K), or scale by percentage in seconds.',
    icon: 'Maximize2',
    isPopular: true,
    keywords: ['resize image', 'change dimensions', 'image scale', 'photo resizer', 'crop dimensions', 'aspect ratio', 'instagram size', 'youtube thumbnail size'],
    features: [
      { title: 'Lock Aspect Ratio', description: 'Keep original proportions intact automatically when adjusting width or height.' },
      { title: 'Social Media Presets', description: 'One-click templates for Instagram posts, stories, YouTube thumbnails, Full HD, and custom dimensions.' },
      { title: 'Percentage Scaling', description: 'Easily scale your photo up or down between 10% and 200% with a single slider.' },
      { title: 'Lossless Resampling', description: 'Smooth high-quality bicubic resampling for sharp graphics and photos.' }
    ],
    howToSteps: [
      { title: 'Choose Image', description: 'Upload the image you want to resize from your device.' },
      { title: 'Set Dimensions', description: 'Enter specific pixel dimensions or select a standard preset like Full HD or Instagram.' },
      { title: 'Toggle Proportions', description: 'Ensure the aspect ratio lock is enabled if you wish to prevent stretching.' },
      { title: 'Download Image', description: 'Click Download to receive your resized image instantly.' }
    ],
    faqs: [
      { question: 'Can I resize without distorting my photo?', answer: 'Yes. Simply keep the "Lock Aspect Ratio" toggle turned on, and changing one dimension will automatically adjust the other proportionally.' },
      { question: 'Does resizing reduce image file size?', answer: 'Downsizing an image reduces total pixel count and significantly decreases file size without compromising pixel density.' },
      { question: 'Are animated GIFs supported?', answer: 'Static images (JPG, PNG, WebP) are fully supported. Animated frame resizing is handled per static keyframe.' }
    ],
    relatedToolIds: ['image-compressor', 'jpg-to-png', 'png-to-webp', 'jpg-to-pdf']
  },
  {
    id: 'jpg-to-png',
    name: 'JPG to PNG Converter',
    path: '/jpg-to-png',
    category: 'images',
    shortDescription: 'Convert JPG/JPEG images to lossless PNG format directly in your browser.',
    fullDescription: 'Easily transform JPG and JPEG photographs into crisp PNG files with alpha transparency readiness. Fast, client-side, and completely free.',
    icon: 'Image',
    isPopular: false,
    isRecent: true,
    keywords: ['jpg to png', 'jpeg to png', 'convert jpg', 'image converter', 'change jpg to png', 'make png'],
    features: [
      { title: 'Lossless PNG Conversion', description: 'Ensures highest clarity and prevents further compression artifacting.' },
      { title: 'Instant Offline Processing', description: 'Zero lag or upload waiting time. Runs immediately inside your browser window.' },
      { title: 'Metadata Preservation', description: 'Preserves image clarity and accurate color depth throughout conversion.' }
    ],
    howToSteps: [
      { title: 'Upload JPG', description: 'Select or drag your JPG or JPEG image into the upload box.' },
      { title: 'Preview Converted Image', description: 'The tool automatically renders and verifies your image as a PNG.' },
      { title: 'Download PNG', description: 'Click the download button to save your converted PNG file.' }
    ],
    faqs: [
      { question: 'Why convert JPG to PNG?', answer: 'PNG uses lossless compression, making it ideal for screenshots, digital art, text overlays, and further editing where generation loss must be avoided.' },
      { question: 'Will converting a JPG to PNG make the background transparent?', answer: 'JPGs do not store transparency data, so the initial conversion keeps the original background intact. PNG format allows you to add transparency in subsequent graphic editing.' }
    ],
    relatedToolIds: ['png-to-webp', 'image-compressor', 'image-resizer', 'jpg-to-pdf']
  },
  {
    id: 'png-to-webp',
    name: 'PNG to WebP Converter',
    path: '/png-to-webp',
    category: 'images',
    shortDescription: 'Convert PNG graphics into ultra-lightweight next-gen WebP format for faster web speed.',
    fullDescription: 'Transform heavy PNG graphics into modern Google WebP format. Achieve up to 80% smaller file sizes while preserving transparency and sharp vector-like clarity.',
    icon: 'FileImage',
    isPopular: false,
    keywords: ['png to webp', 'convert to webp', 'next gen image', 'webp converter', 'speed up website images', 'reduce png size'],
    features: [
      { title: 'Next-Gen Format', description: 'WebP delivers superior compression for web performance and higher Google PageSpeed scores.' },
      { title: 'Alpha Transparency Support', description: 'Maintains transparent backgrounds from your original PNG graphics.' },
      { title: 'Quality Adjustment', description: 'Customize WebP output quality from lossless to high compression.' }
    ],
    howToSteps: [
      { title: 'Select PNG', description: 'Upload any PNG image with or without a transparent background.' },
      { title: 'Set Quality Slider', description: 'Choose your desired compression balance (85% recommended for web).' },
      { title: 'Download WebP', description: 'Save the optimized .webp file ready for website deployment.' }
    ],
    faqs: [
      { question: 'What are the advantages of WebP?', answer: 'WebP images are on average 26% smaller than PNGs and 25-34% smaller than comparable JPEGs while supporting both lossless transparency and lossy compression.' },
      { question: 'Do all modern browsers support WebP?', answer: 'Yes, over 97% of global web browsers including Chrome, Safari, Edge, Firefox, and Opera natively support WebP.' }
    ],
    relatedToolIds: ['jpg-to-png', 'image-compressor', 'image-resizer', 'jpg-to-pdf']
  },

  // --- PDF TOOLS ---
  {
    id: 'pdf-tools',
    name: 'PDF Tools Hub',
    path: '/pdf-tools',
    category: 'pdf',
    shortDescription: 'All-in-one PDF utility suite: merge, split, compress, extract pages, and convert between PDF and images.',
    fullDescription: 'Comprehensive PDF manipulation platform designed for speed and security. Merge multiple PDFs, split documents, extract exact pages, convert JPG to PDF, or export PDF pages to JPGs—all running securely in your browser.',
    icon: 'FileText',
    isPopular: true,
    badge: 'Popular',
    keywords: ['pdf tools', 'pdf editor', 'merge pdf', 'split pdf', 'compress pdf', 'pdf to jpg', 'jpg to pdf', 'extract pdf pages'],
    features: [
      { title: 'Zero Cloud Storage', description: 'Documents are processed locally in your browser memory and never uploaded to remote servers.' },
      { title: 'Complete Utility Suite', description: 'Six dedicated PDF workflows in one unified, clean interface.' },
      { title: 'High-DPI PDF Rendering', description: 'Crisp page previews and ultra-sharp image export capabilities.' }
    ],
    howToSteps: [
      { title: 'Choose a PDF Tool', description: 'Select whether you want to Merge, Split, Compress, Convert, or Extract pages.' },
      { title: 'Upload Your Documents', description: 'Drop your PDF files or images into the active workspace.' },
      { title: 'Configure & Process', description: 'Reorder pages, set split ranges, or adjust output settings.' },
      { title: 'Download Finished PDF', description: 'Save the processed PDF or image archive immediately.' }
    ],
    faqs: [
      { question: 'Is my confidential PDF safe here?', answer: 'Yes! ToolBoxX processes PDF files locally on your machine via WebAssembly and JavaScript. No document content is ever sent over the wire or stored on any server.' },
      { question: 'Can I merge multiple large PDFs?', answer: 'Yes, you can merge dozens of PDF files quickly depending on your local computer memory.' }
    ],
    relatedToolIds: ['pdf-merge', 'pdf-split', 'pdf-to-jpg', 'jpg-to-pdf', 'pdf-extract', 'pdf-compress']
  },
  {
    id: 'pdf-merge',
    name: 'PDF Merge',
    path: '/pdf-merge',
    category: 'pdf',
    shortDescription: 'Combine multiple PDF files into one single organized document in your browser.',
    fullDescription: 'Combine two or more PDF documents into a single unified file. Rearrange document order with easy up/down controls, preview page counts, and merge in seconds.',
    icon: 'Layers',
    isPopular: true,
    keywords: ['merge pdf', 'combine pdf', 'join pdfs', 'concatenate pdf', 'stitch pdf', 'pdf merger'],
    features: [
      { title: 'Multi-File Ordering', description: 'Easily move uploaded files up and down to define the exact page sequence.' },
      { title: 'Fast Client-Side Assembly', description: 'Combines multi-page documents in milliseconds using pdf-lib.' },
      { title: 'Unlimited Files', description: 'Merge as many files as you need with no upload limits or queues.' }
    ],
    howToSteps: [
      { title: 'Upload PDF Files', description: 'Select or drag multiple PDF files into the tool.' },
      { title: 'Arrange Document Order', description: 'Use the arrow controls to organize the order in which files will appear.' },
      { title: 'Merge Documents', description: 'Click "Merge PDFs" to combine all pages into one file.' },
      { title: 'Download Single PDF', description: 'Save your merged document directly to your device.' }
    ],
    faqs: [
      { question: 'Is there a limit on how many PDFs I can merge?', answer: 'No artificial limit exists. You can merge as many documents as your device memory comfortably allows.' },
      { question: 'Will bookmarks and forms be preserved?', answer: 'Standard pages, text, graphics, and annotations are preserved in the merged output.' }
    ],
    relatedToolIds: ['pdf-split', 'pdf-extract', 'pdf-to-jpg', 'jpg-to-pdf']
  },
  {
    id: 'pdf-split',
    name: 'PDF Split',
    path: '/pdf-split',
    category: 'pdf',
    shortDescription: 'Split a PDF into separate files by custom page ranges or extract every page.',
    fullDescription: 'Divide large PDF files into smaller documents. Specify custom page ranges (e.g., 1-3, 4-6) or split every single page into individual standalone PDF documents.',
    icon: 'Scissors',
    isPopular: false,
    keywords: ['split pdf', 'divide pdf', 'separate pdf pages', 'pdf range splitter', 'break pdf'],
    features: [
      { title: 'Custom Range Selection', description: 'Define custom intervals like "1-2, 3-5" to create multiple targeted documents.' },
      { title: 'Split All Pages Option', description: 'Extract each page of a multi-page PDF as an independent file packaged in a ZIP.' },
      { title: 'Page Count Inspection', description: 'Instantly view total pages in your uploaded document before splitting.' }
    ],
    howToSteps: [
      { title: 'Upload PDF', description: 'Drag and drop your PDF document.' },
      { title: 'Select Split Mode', description: 'Choose between Custom Range (e.g. 1-3) or Split Every Page.' },
      { title: 'Execute Split', description: 'Click "Split PDF" to process the pages.' },
      { title: 'Download Result', description: 'Download your newly separated PDF or ZIP bundle.' }
    ],
    faqs: [
      { question: 'How do I specify multiple ranges?', answer: 'Enter page ranges separated by commas, such as "1-3, 4-5, 6-10", to generate individual PDF documents for each segment.' },
      { question: 'Are files kept private?', answer: 'Yes, all PDF parsing and byte-slicing runs strictly within your browser environment.' }
    ],
    relatedToolIds: ['pdf-extract', 'pdf-merge', 'pdf-to-jpg', 'pdf-compress']
  },
  {
    id: 'pdf-compress',
    name: 'PDF Compress',
    path: '/pdf-compress',
    category: 'pdf',
    shortDescription: 'Reduce PDF file size by stripping redundant metadata and optimizing document structure.',
    fullDescription: 'Optimize and compress PDF documents for faster emailing and web uploads. Choose compression intensity levels and download an optimized PDF document directly.',
    icon: 'Minimize',
    isPopular: false,
    keywords: ['compress pdf', 'reduce pdf size', 'shrink pdf', 'optimize pdf', 'make pdf smaller'],
    features: [
      { title: 'Object Stream Compression', description: 'Optimizes document data streams and strips duplicate unreferenced objects.' },
      { title: 'Compression Presets', description: 'Select between Extreme, Recommended, and Basic compression levels.' },
      { title: 'Private & Secure', description: 'Your confidential records never leave your local browser sandbox.' }
    ],
    howToSteps: [
      { title: 'Upload PDF Document', description: 'Select the PDF file you need to compress.' },
      { title: 'Select Compression Level', description: 'Pick Recommended Compression for standard balance or Extreme for maximum reduction.' },
      { title: 'Optimize Document', description: 'Click "Compress PDF" to process the data streams.' },
      { title: 'Download Smaller PDF', description: 'Check the file size savings and download your optimized document.' }
    ],
    faqs: [
      { question: 'How much can a PDF be compressed?', answer: 'Documents with high-resolution scans and bloated metadata can often be reduced by 30% to 70%. Text-heavy vector PDFs are already compact and will see cleaner structure optimization.' }
    ],
    relatedToolIds: ['pdf-merge', 'pdf-split', 'pdf-to-jpg', 'image-compressor']
  },
  {
    id: 'pdf-to-jpg',
    name: 'PDF to JPG Converter',
    path: '/pdf-to-jpg',
    category: 'pdf',
    shortDescription: 'Convert PDF document pages into high-resolution JPG images with instant thumbnail previews.',
    fullDescription: 'Extract and render every page of your PDF file into high-quality JPG images. Preview all page thumbnails live, download individual images, or save all pages in a single convenient ZIP file.',
    icon: 'FileSpreadsheet',
    isPopular: true,
    keywords: ['pdf to jpg', 'pdf to image', 'convert pdf to jpeg', 'pdf pages to images', 'extract pictures from pdf'],
    features: [
      { title: 'High-DPI Rendering', description: 'Crisp 2x canvas scaling ensures text and graphics remain clear and legible.' },
      { title: 'Visual Page Gallery', description: 'Inspect rendered thumbnails of every page directly in your browser.' },
      { title: 'Batch ZIP Download', description: 'Download all rendered pages at once inside an organized ZIP archive.' }
    ],
    howToSteps: [
      { title: 'Upload PDF', description: 'Select your PDF document from your computer or phone.' },
      { title: 'Wait for Page Rendering', description: 'ToolBoxX renders each page on an HTML5 canvas in real-time.' },
      { title: 'Select & Download', description: 'Download individual page images or click "Download All (ZIP)" for the complete set.' }
    ],
    faqs: [
      { question: 'What image quality does PDF to JPG produce?', answer: 'ToolBoxX renders pages at high resolution (150-300 DPI equivalent) with 92% JPEG quality for sharp text and vibrant visuals.' },
      { question: 'Can I convert multi-page documents?', answer: 'Yes! All pages are rendered sequentially with individual download buttons and a single-click ZIP bundle option.' }
    ],
    relatedToolIds: ['jpg-to-pdf', 'pdf-merge', 'pdf-extract', 'image-compressor']
  },
  {
    id: 'jpg-to-pdf',
    name: 'JPG to PDF Converter',
    path: '/jpg-to-pdf',
    category: 'pdf',
    shortDescription: 'Turn single or multiple JPG, PNG, and WebP images into a clean, formatted PDF document.',
    fullDescription: 'Combine multiple image files into an organized PDF document. Reorder pages, select page orientation (Auto, Portrait, Landscape), and configure margins in a few clicks.',
    icon: 'FileUp',
    isPopular: true,
    badge: 'Popular',
    keywords: ['jpg to pdf', 'image to pdf', 'photos to pdf', 'png to pdf', 'convert pictures to pdf', 'make pdf from images'],
    features: [
      { title: 'Multi-Image Upload', description: 'Add multiple photos at once and rearrange their page sequence.' },
      { title: 'Orientation & Margins', description: 'Select Auto-fit, Portrait, or Landscape with custom padding.' },
      { title: 'Lossless Image Embedding', description: 'Embeds your photos directly into standard PDF page objects.' }
    ],
    howToSteps: [
      { title: 'Upload Photos', description: 'Drop JPG, PNG, or WebP images into the converter.' },
      { title: 'Arrange Page Sequence', description: 'Sort the images to define which picture appears on each page.' },
      { title: 'Adjust Layout', description: 'Select orientation and margin preferences.' },
      { title: 'Create PDF', description: 'Click "Convert to PDF" and download your newly compiled document.' }
    ],
    faqs: [
      { question: 'Can I combine different image formats into one PDF?', answer: 'Yes! You can mix JPG, PNG, and WebP photos together in a single PDF document.' },
      { question: 'Will image resolution be downgraded?', answer: 'No, photos are embedded at their native pixel dimensions so printed quality remains intact.' }
    ],
    relatedToolIds: ['pdf-to-jpg', 'pdf-merge', 'image-compressor', 'image-resizer']
  },
  {
    id: 'pdf-extract',
    name: 'PDF Page Extractor',
    path: '/pdf-extract',
    category: 'pdf',
    shortDescription: 'Visually select and extract specific pages from any PDF document into a new file.',
    fullDescription: 'Visual page picker for PDF documents. Click thumbnails to select or deselect specific pages, and generate a clean new PDF containing only the pages you want.',
    icon: 'CheckSquare',
    isPopular: false,
    isRecent: true,
    keywords: ['pdf extract', 'extract pages from pdf', 'select pdf pages', 'remove pdf pages', 'filter pdf pages'],
    features: [
      { title: 'Interactive Page Grid', description: 'Click on visual page cards to toggle inclusion in your new document.' },
      { title: 'Select All / Invert Options', description: 'One-click helpers to select even, odd, or custom ranges.' },
      { title: 'Instant Assembly', description: 'Extracts exact page streams and recompiles a light new PDF.' }
    ],
    howToSteps: [
      { title: 'Upload PDF', description: 'Open your multi-page PDF document.' },
      { title: 'Select Desired Pages', description: 'Click the thumbnail checkboxes for all pages you wish to keep.' },
      { title: 'Extract Pages', description: 'Click "Extract Selected Pages".' },
      { title: 'Download New PDF', description: 'Save your customized PDF document immediately.' }
    ],
    faqs: [
      { question: 'How is this different from PDF Split?', answer: 'PDF Extract provides an interactive visual page selector where you can click individual pages (e.g. pages 1, 4, 7) instead of typing textual ranges.' }
    ],
    relatedToolIds: ['pdf-split', 'pdf-merge', 'pdf-to-jpg', 'pdf-tools']
  },
  {
    id: 'rotate-pdf',
    name: 'Rotate PDF',
    path: '/rotate-pdf',
    category: 'pdf',
    shortDescription: 'Rotate PDF pages by 90°, 180°, or 270° individually or in bulk.',
    fullDescription: 'Quickly fix page orientation issues by rotating selected pages or the entire document. Preview thumbnails, choose rotation angles, and download the corrected PDF instantly.',
    icon: 'RotateCw',
    keywords: ['rotate pdf', 'turn pdf page', 'fix pdf orientation', 'landscape to portrait pdf', 'rotate pdf pages'],
    features: [
      { title: 'Selective Page Rotation', description: 'Choose specific pages to rotate while leaving others untouched.' },
      { title: 'Multiple Angle Options', description: 'Rotate pages by 90°, 180°, or 270° clockwise.' },
      { title: 'Visual Preview', description: 'See page thumbnails before and after rotation.' }
    ],
    howToSteps: [
      { title: 'Upload PDF', description: 'Select the PDF document with pages that need rotation.' },
      { title: 'Select Pages & Angle', description: 'Pick which pages to rotate and choose the rotation angle.' },
      { title: 'Apply Rotation', description: 'Click Rotate to process the selected pages.' },
      { title: 'Download PDF', description: 'Save the corrected PDF document to your device.' }
    ],
    faqs: [
      { question: 'Can I rotate individual pages differently?', answer: 'Yes, you can select specific pages and apply different rotation angles to each batch.' }
    ],
    relatedToolIds: ['organize-pdf', 'remove-pages', 'crop-pdf', 'pdf-tools']
  },
  {
    id: 'add-page-numbers',
    name: 'Add Page Numbers',
    path: '/add-page-numbers',
    category: 'pdf',
    shortDescription: 'Add customizable page numbers to any PDF document in your preferred position and format.',
    fullDescription: 'Automatically add page numbers to every page of your PDF document. Choose from multiple positions (top/bottom, left/center/right), font sizes, starting number, and numbering formats.',
    icon: 'ListOrdered',
    keywords: ['add page numbers pdf', 'number pdf pages', 'pdf pagination', 'insert page numbers', 'pdf page numbering'],
    features: [
      { title: 'Flexible Positioning', description: 'Place numbers at top or bottom, aligned left, center, or right.' },
      { title: 'Custom Formats', description: 'Choose from "Page X", "X", or "X of N" numbering styles.' },
      { title: 'Adjustable Typography', description: 'Set font size from 10 to 24 points with custom starting number.' }
    ],
    howToSteps: [
      { title: 'Upload PDF', description: 'Select your PDF document.' },
      { title: 'Configure Style', description: 'Choose position, format, font size, and starting page number.' },
      { title: 'Add Numbers', description: 'Click to add page numbers to every page.' },
      { title: 'Download PDF', description: 'Save the numbered document.' }
    ],
    faqs: [
      { question: 'Can I skip the first page?', answer: 'Yes, set the starting page number to begin numbering from page 2 onwards.' }
    ],
    relatedToolIds: ['add-watermark', 'edit-pdf', 'organize-pdf', 'pdf-tools']
  },
  {
    id: 'add-watermark',
    name: 'Add Watermark',
    path: '/add-watermark',
    category: 'pdf',
    shortDescription: 'Stamp a custom text watermark across all pages of your PDF with adjustable opacity and rotation.',
    fullDescription: 'Protect your documents by adding a semi-transparent text watermark. Customize the watermark text, opacity, font size, color, and diagonal rotation angle across every page.',
    icon: 'Droplets',
    keywords: ['add watermark pdf', 'pdf watermark', 'stamp pdf', 'confidential stamp', 'draft watermark pdf'],
    features: [
      { title: 'Custom Text', description: 'Enter any watermark text such as CONFIDENTIAL, DRAFT, or your company name.' },
      { title: 'Adjustable Opacity', description: 'Fine-tune transparency from barely visible to prominently displayed.' },
      { title: 'Diagonal Rotation', description: 'Apply custom rotation angle for professional diagonal watermarks.' }
    ],
    howToSteps: [
      { title: 'Upload PDF', description: 'Select the document to watermark.' },
      { title: 'Enter Watermark Text', description: 'Type your desired watermark message.' },
      { title: 'Adjust Settings', description: 'Configure opacity, font size, color, and rotation angle.' },
      { title: 'Download PDF', description: 'Save your watermarked document.' }
    ],
    faqs: [
      { question: 'Is the watermark permanent?', answer: 'Yes, the watermark is drawn directly into the PDF page content and cannot be easily removed.' }
    ],
    relatedToolIds: ['protect-pdf', 'add-page-numbers', 'edit-pdf', 'pdf-tools']
  },
  {
    id: 'remove-pages',
    name: 'Remove Pages',
    path: '/remove-pages',
    category: 'pdf',
    shortDescription: 'Visually select and delete unwanted pages from any PDF document.',
    fullDescription: 'Remove specific pages from your PDF by clicking on visual thumbnails. Select the pages you want to delete, and generate a clean PDF with only the pages you want to keep.',
    icon: 'Trash2',
    keywords: ['remove pdf pages', 'delete pdf pages', 'remove page from pdf', 'pdf page remover', 'trim pdf'],
    features: [
      { title: 'Visual Page Selector', description: 'Click page thumbnails to mark them for deletion with clear visual indicators.' },
      { title: 'Bulk Selection', description: 'Select All, Deselect All, or Invert your selection with one click.' },
      { title: 'Safe Preview', description: 'Review which pages will be kept before finalizing.' }
    ],
    howToSteps: [
      { title: 'Upload PDF', description: 'Open the PDF document you want to edit.' },
      { title: 'Select Pages to Remove', description: 'Click the pages you want to delete (highlighted in red).' },
      { title: 'Remove Pages', description: 'Click Remove to create the trimmed document.' },
      { title: 'Download PDF', description: 'Save the cleaned-up PDF.' }
    ],
    faqs: [
      { question: 'Is this different from Extract Pages?', answer: 'Yes — Remove Pages lets you select pages to DELETE, while Extract Pages lets you select pages to KEEP. They are inverse operations.' }
    ],
    relatedToolIds: ['pdf-extract', 'organize-pdf', 'pdf-split', 'pdf-tools']
  },
  {
    id: 'organize-pdf',
    name: 'Organize PDF',
    path: '/organize-pdf',
    category: 'pdf',
    shortDescription: 'Drag and reorder PDF pages into any sequence with visual thumbnails.',
    fullDescription: 'Rearrange the page order of any PDF document using an intuitive visual interface. Move pages up, down, or to any position, then rebuild the document in your custom sequence.',
    icon: 'ArrowUpDown',
    keywords: ['organize pdf', 'reorder pdf pages', 'rearrange pdf', 'sort pdf pages', 'move pdf pages'],
    features: [
      { title: 'Visual Drag & Drop', description: 'See page thumbnails and reorder them with up/down controls.' },
      { title: 'Full Page Preview', description: 'Rendered thumbnails for easy visual identification of each page.' },
      { title: 'Instant Rebuild', description: 'Reconstruct the PDF in your new page order in seconds.' }
    ],
    howToSteps: [
      { title: 'Upload PDF', description: 'Select the multi-page PDF document.' },
      { title: 'Rearrange Pages', description: 'Use the up/down arrows to move pages into your desired order.' },
      { title: 'Rebuild PDF', description: 'Click Organize to build the PDF in the new sequence.' },
      { title: 'Download PDF', description: 'Save your reorganized document.' }
    ],
    faqs: [
      { question: 'Can I reverse the entire page order?', answer: 'Yes, simply move pages to reverse their positions, or use the Reverse All button if available.' }
    ],
    relatedToolIds: ['rotate-pdf', 'remove-pages', 'pdf-merge', 'pdf-tools']
  },
  {
    id: 'repair-pdf',
    name: 'Repair PDF',
    path: '/repair-pdf',
    category: 'pdf',
    shortDescription: 'Fix corrupted or damaged PDF files by rebuilding their internal structure.',
    fullDescription: 'Repair broken PDF documents by reloading and rebuilding the internal object structure. Fixes common issues like missing cross-references, corrupted streams, and invalid page trees.',
    icon: 'Wrench',
    keywords: ['repair pdf', 'fix pdf', 'broken pdf', 'corrupted pdf', 'recover pdf', 'pdf repair tool'],
    features: [
      { title: 'Structure Rebuild', description: 'Reloads and re-serializes the entire PDF object tree to fix structural corruption.' },
      { title: 'Object Stream Optimization', description: 'Compresses internal data streams for a cleaner, smaller output file.' },
      { title: 'Before/After Comparison', description: 'View original vs repaired file sizes side by side.' }
    ],
    howToSteps: [
      { title: 'Upload Damaged PDF', description: 'Select the PDF file that appears corrupted or won\'t open correctly.' },
      { title: 'Repair Document', description: 'Click Repair to rebuild the internal structure.' },
      { title: 'Review Results', description: 'Check the repaired file size and page count.' },
      { title: 'Download Repaired PDF', description: 'Save the fixed document to your device.' }
    ],
    faqs: [
      { question: 'What types of corruption can this fix?', answer: 'This tool fixes structural issues like broken cross-reference tables, missing page objects, and corrupted metadata. Severely damaged files with destroyed page content may not be fully recoverable.' }
    ],
    relatedToolIds: ['pdf-compress', 'unlock-pdf', 'pdf-tools']
  },
  {
    id: 'unlock-pdf',
    name: 'Unlock PDF',
    path: '/unlock-pdf',
    category: 'pdf',
    shortDescription: 'Remove password protection and restrictions from PDF documents.',
    fullDescription: 'Unlock password-protected PDF files to enable printing, copying, and editing. Enter the document password if required, and download an unrestricted version of the PDF.',
    icon: 'Unlock',
    keywords: ['unlock pdf', 'remove pdf password', 'unprotect pdf', 'pdf password remover', 'decrypt pdf'],
    features: [
      { title: 'Password Input', description: 'Enter the document password to decrypt and unlock the file.' },
      { title: 'Permission Removal', description: 'Removes printing, copying, and editing restrictions.' },
      { title: 'Client-Side Decryption', description: 'Your password and document never leave your browser.' }
    ],
    howToSteps: [
      { title: 'Upload Protected PDF', description: 'Select the password-protected PDF file.' },
      { title: 'Enter Password', description: 'Type the document password if one is required.' },
      { title: 'Unlock Document', description: 'Click Unlock to remove restrictions.' },
      { title: 'Download Unlocked PDF', description: 'Save the unrestricted version.' }
    ],
    faqs: [
      { question: 'Do I need to know the password?', answer: 'If the PDF has an owner password restricting actions like printing, the tool can often bypass it. If the PDF requires a user password to open, you must provide the correct password.' }
    ],
    relatedToolIds: ['protect-pdf', 'repair-pdf', 'pdf-compress', 'pdf-tools']
  },
  {
    id: 'protect-pdf',
    name: 'Protect PDF',
    path: '/protect-pdf',
    category: 'pdf',
    shortDescription: 'Add protection metadata and permission flags to your PDF documents.',
    fullDescription: 'Add a protective layer to your PDF documents with permission flags and metadata stamping. Note: Full cryptographic encryption requires server-side tools like Adobe Acrobat.',
    icon: 'ShieldCheck',
    keywords: ['protect pdf', 'password protect pdf', 'secure pdf', 'encrypt pdf', 'lock pdf'],
    features: [
      { title: 'Permission Flags', description: 'Set metadata flags for printing, copying, and modification permissions.' },
      { title: 'Protection Stamp', description: 'Adds a visible PROTECTED indicator to the document.' },
      { title: 'Metadata Cleanup', description: 'Updates producer and creator metadata for document provenance.' }
    ],
    howToSteps: [
      { title: 'Upload PDF', description: 'Select the document you want to protect.' },
      { title: 'Configure Protection', description: 'Set password and permission options.' },
      { title: 'Apply Protection', description: 'Click Protect to apply settings.' },
      { title: 'Download Protected PDF', description: 'Save the protected document.' }
    ],
    faqs: [
      { question: 'Is this full encryption?', answer: 'This tool applies metadata-level protection and a visual stamp. For full AES/RC4 cryptographic encryption, use Adobe Acrobat or a server-side solution.' }
    ],
    relatedToolIds: ['unlock-pdf', 'add-watermark', 'sign-pdf', 'pdf-tools']
  },
  {
    id: 'pdf-to-pdfa',
    name: 'PDF to PDF/A',
    path: '/pdf-to-pdfa',
    category: 'pdf',
    shortDescription: 'Convert PDF documents to PDF/A archival format with conformance metadata.',
    fullDescription: 'Apply PDF/A archival conformance metadata to your documents for long-term preservation. Updates document properties, strips non-essential metadata, and optimizes the file structure.',
    icon: 'Archive',
    keywords: ['pdf to pdfa', 'pdfa converter', 'archival pdf', 'pdf/a format', 'long term preservation pdf', 'iso 19005'],
    features: [
      { title: 'Conformance Metadata', description: 'Sets PDF/A XMP metadata tags for archival compliance.' },
      { title: 'Metadata Cleanup', description: 'Strips non-essential metadata and updates document properties.' },
      { title: 'Structure Optimization', description: 'Re-saves with object streams for optimal file structure.' }
    ],
    howToSteps: [
      { title: 'Upload PDF', description: 'Select the PDF document to convert.' },
      { title: 'Review Metadata', description: 'See current vs new metadata that will be applied.' },
      { title: 'Convert to PDF/A', description: 'Click Convert to apply archival conformance.' },
      { title: 'Download PDF/A', description: 'Save the archival-ready document.' }
    ],
    faqs: [
      { question: 'Is this full ISO 19005 compliance?', answer: 'This applies PDF/A metadata conformance. Full ISO 19005 validation requires specialized certification tools.' }
    ],
    relatedToolIds: ['pdf-compress', 'repair-pdf', 'protect-pdf', 'pdf-tools']
  },
  {
    id: 'crop-pdf',
    name: 'Crop PDF',
    path: '/crop-pdf',
    category: 'pdf',
    shortDescription: 'Crop and trim margins from PDF pages to remove unwanted whitespace or borders.',
    fullDescription: 'Precisely crop PDF page margins by specifying top, bottom, left, and right crop values. Preview the crop area visually and apply it to all pages or specific page ranges.',
    icon: 'Crop',
    keywords: ['crop pdf', 'trim pdf margins', 'pdf crop tool', 'remove pdf borders', 'resize pdf pages', 'cut pdf margins'],
    features: [
      { title: 'Precise Margin Control', description: 'Set crop values in points for top, bottom, left, and right margins independently.' },
      { title: 'Visual Preview', description: 'See the crop rectangle overlaid on your page thumbnail.' },
      { title: 'Batch Processing', description: 'Apply the same crop settings to all pages at once.' }
    ],
    howToSteps: [
      { title: 'Upload PDF', description: 'Select the PDF document to crop.' },
      { title: 'Set Crop Margins', description: 'Enter crop values for each side or adjust the visual crop overlay.' },
      { title: 'Apply Crop', description: 'Click Crop to apply the crop box to all pages.' },
      { title: 'Download Cropped PDF', description: 'Save the trimmed document.' }
    ],
    faqs: [
      { question: 'Does cropping reduce file size?', answer: 'Cropping sets a viewport crop box rather than deleting content, so file size changes are minimal. For size reduction, use PDF Compress.' }
    ],
    relatedToolIds: ['rotate-pdf', 'organize-pdf', 'pdf-compress', 'pdf-tools']
  },
  {
    id: 'edit-pdf',
    name: 'Edit PDF',
    path: '/edit-pdf',
    category: 'pdf',
    shortDescription: 'Add text, shapes, and annotations to PDF documents directly in your browser.',
    fullDescription: 'Edit PDF files by adding text overlays, rectangles, and circles directly on the page. Click anywhere on the page to place annotations, customize colors and font sizes, then save the edited document.',
    icon: 'Pencil',
    keywords: ['edit pdf', 'pdf editor', 'add text to pdf', 'annotate pdf', 'pdf annotation tool', 'mark up pdf'],
    features: [
      { title: 'Text Overlay', description: 'Click anywhere on a page to add custom text with configurable font size and color.' },
      { title: 'Shape Drawing', description: 'Add rectangles and circles to highlight or annotate areas.' },
      { title: 'Multi-Page Editing', description: 'Navigate between pages and add annotations to any page.' }
    ],
    howToSteps: [
      { title: 'Upload PDF', description: 'Select the PDF document to edit.' },
      { title: 'Choose Tool', description: 'Select Text, Rectangle, or Circle from the toolbar.' },
      { title: 'Click to Place', description: 'Click on the page to place your annotation.' },
      { title: 'Download Edited PDF', description: 'Save the annotated document.' }
    ],
    faqs: [
      { question: 'Can I edit existing text in the PDF?', answer: 'This tool adds new text and shapes on top of the existing content. Modifying existing embedded text requires advanced PDF editors.' }
    ],
    relatedToolIds: ['add-watermark', 'add-page-numbers', 'sign-pdf', 'pdf-tools']
  },
  {
    id: 'sign-pdf',
    name: 'Sign PDF',
    path: '/sign-pdf',
    category: 'pdf',
    shortDescription: 'Draw your signature on a canvas and place it on any page of your PDF document.',
    fullDescription: 'Add your handwritten signature to PDF documents using an interactive signature pad. Draw your signature with mouse or touch, position it on the desired page, and embed it permanently.',
    icon: 'PenTool',
    keywords: ['sign pdf', 'pdf signature', 'e-signature pdf', 'digital signature', 'add signature to pdf', 'pdf signer'],
    features: [
      { title: 'Signature Canvas', description: 'Draw your signature naturally with mouse or touchscreen input.' },
      { title: 'Page Selection', description: 'Choose which page to place your signature on.' },
      { title: 'Permanent Embedding', description: 'Signature is embedded as an image and cannot be removed.' }
    ],
    howToSteps: [
      { title: 'Upload PDF', description: 'Select the document you need to sign.' },
      { title: 'Draw Signature', description: 'Use the signature pad to draw your signature.' },
      { title: 'Place Signature', description: 'Select the page and position for your signature.' },
      { title: 'Download Signed PDF', description: 'Save the signed document.' }
    ],
    faqs: [
      { question: 'Is this a legally binding digital signature?', answer: 'This creates a visual signature stamp. For legally binding cryptographic signatures with certificates, use specialized e-signature services.' }
    ],
    relatedToolIds: ['edit-pdf', 'protect-pdf', 'add-watermark', 'pdf-tools']
  },
  {
    id: 'redact-pdf',
    name: 'Redact PDF',
    path: '/redact-pdf',
    category: 'pdf',
    shortDescription: 'Permanently black out sensitive information in PDF documents.',
    fullDescription: 'Securely redact confidential text and images by drawing black rectangles over sensitive areas. The document is flattened (rasterized) to ensure redacted content is permanently destroyed and cannot be recovered.',
    icon: 'EyeOff',
    keywords: ['redact pdf', 'black out pdf', 'censor pdf', 'hide text pdf', 'pdf redaction', 'remove sensitive info'],
    features: [
      { title: 'Draw to Redact', description: 'Click and drag to draw black boxes over sensitive content.' },
      { title: 'Permanent Destruction', description: 'Pages are rasterized so redacted content cannot be recovered or extracted.' },
      { title: 'Multi-Page Support', description: 'Redact content across multiple pages in the same document.' }
    ],
    howToSteps: [
      { title: 'Upload PDF', description: 'Select the PDF with sensitive content.' },
      { title: 'Draw Redaction Boxes', description: 'Click and drag over areas to redact on each page.' },
      { title: 'Apply Redaction', description: 'Click Apply to permanently flatten and destroy redacted content.' },
      { title: 'Download Redacted PDF', description: 'Save the securely redacted document.' }
    ],
    faqs: [
      { question: 'Can redacted content be recovered?', answer: 'No. The pages are fully rasterized (converted to images), so the original text and vector data behind the black boxes is permanently destroyed.' }
    ],
    relatedToolIds: ['edit-pdf', 'protect-pdf', 'sign-pdf', 'pdf-tools']
  },
  {
    id: 'compare-pdf',
    name: 'Compare PDF',
    path: '/compare-pdf',
    category: 'pdf',
    shortDescription: 'Compare two PDF documents side by side and highlight visual differences.',
    fullDescription: 'Upload two PDF files to compare them visually. The tool renders both documents and computes a pixel-level difference overlay, highlighting changes in red for easy identification.',
    icon: 'GitCompare',
    keywords: ['compare pdf', 'diff pdf', 'pdf comparison', 'find differences pdf', 'pdf visual diff'],
    features: [
      { title: 'Side-by-Side View', description: 'View both PDFs rendered next to each other for easy comparison.' },
      { title: 'Pixel Difference Overlay', description: 'Red highlights show exactly where the two documents differ.' },
      { title: 'Difference Percentage', description: 'Quantified change metric showing the percentage of modified pixels.' }
    ],
    howToSteps: [
      { title: 'Upload Original PDF', description: 'Select the first (original) PDF document.' },
      { title: 'Upload Modified PDF', description: 'Select the second (modified) PDF document.' },
      { title: 'Compare Pages', description: 'View the side-by-side comparison with highlighted differences.' },
      { title: 'Review Changes', description: 'Check the diff percentage and visual overlay.' }
    ],
    faqs: [
      { question: 'Does this compare text content?', answer: 'This tool performs visual (pixel-level) comparison. It highlights any visual difference including text changes, image changes, and layout shifts.' }
    ],
    relatedToolIds: ['pdf-merge', 'pdf-extract', 'edit-pdf', 'pdf-tools']
  },
  {
    id: 'html-to-pdf',
    name: 'HTML to PDF',
    path: '/html-to-pdf',
    category: 'pdf',
    shortDescription: 'Convert HTML code into a clean PDF document with custom page sizes.',
    fullDescription: 'Paste HTML markup and preview it live in the browser. Convert the rendered HTML to a high-quality PDF document with customizable page size (A4, Letter, Legal) and orientation.',
    icon: 'Code',
    keywords: ['html to pdf', 'convert html to pdf', 'webpage to pdf', 'html converter', 'web page pdf'],
    features: [
      { title: 'Live HTML Preview', description: 'See your HTML rendered in real-time before conversion.' },
      { title: 'Custom Page Sizes', description: 'Choose from A4, Letter, or Legal page formats.' },
      { title: 'Orientation Control', description: 'Select portrait or landscape output orientation.' }
    ],
    howToSteps: [
      { title: 'Paste HTML Code', description: 'Enter or paste your HTML markup into the editor.' },
      { title: 'Preview Render', description: 'Review how the HTML looks in the live preview panel.' },
      { title: 'Configure Page Size', description: 'Select your preferred page size and orientation.' },
      { title: 'Download PDF', description: 'Convert and download the HTML as a PDF document.' }
    ],
    faqs: [
      { question: 'Does this support CSS styling?', answer: 'Yes, inline styles and embedded CSS within the HTML are fully rendered in the preview and conversion.' }
    ],
    relatedToolIds: ['word-to-pdf', 'pdf-compress', 'edit-pdf', 'pdf-tools']
  },
  {
    id: 'scan-to-pdf',
    name: 'Scan to PDF',
    path: '/scan-to-pdf',
    category: 'pdf',
    shortDescription: 'Use your device camera to scan documents and convert them into PDF files.',
    fullDescription: 'Turn your phone or laptop camera into a document scanner. Capture multiple pages, preview them as thumbnails, rearrange or delete captures, and compile everything into a multi-page PDF.',
    icon: 'Camera',
    keywords: ['scan to pdf', 'document scanner', 'camera to pdf', 'phone scanner', 'mobile scan pdf'],
    features: [
      { title: 'Camera Integration', description: 'Access your device camera directly from the browser for instant scanning.' },
      { title: 'Multi-Page Capture', description: 'Scan multiple pages and compile them into a single PDF.' },
      { title: 'Page Management', description: 'Reorder, delete, and preview captured pages before creating the PDF.' }
    ],
    howToSteps: [
      { title: 'Allow Camera Access', description: 'Grant browser permission to access your camera.' },
      { title: 'Capture Pages', description: 'Point your camera at the document and click Capture for each page.' },
      { title: 'Review & Arrange', description: 'Preview thumbnails and rearrange the page order.' },
      { title: 'Create PDF', description: 'Click Convert to generate and download your scanned PDF.' }
    ],
    faqs: [
      { question: 'Which cameras are supported?', answer: 'Any device with a camera accessible via the browser (phones, tablets, laptops with webcams). Rear cameras on mobile devices produce the best results.' }
    ],
    relatedToolIds: ['jpg-to-pdf', 'pdf-compress', 'organize-pdf', 'pdf-tools']
  },
  {
    id: 'pdf-forms',
    name: 'PDF Forms',
    path: '/pdf-forms',
    category: 'pdf',
    shortDescription: 'Detect, fill, and flatten interactive form fields in PDF documents.',
    fullDescription: 'Upload a PDF with interactive form fields (text inputs, checkboxes, dropdowns, radio buttons) and fill them directly in the browser. Flatten the form to permanently embed values into the document.',
    icon: 'FileInput',
    keywords: ['pdf forms', 'fill pdf form', 'pdf form filler', 'editable pdf', 'flatten pdf form', 'pdf form fields'],
    features: [
      { title: 'Auto-Detection', description: 'Automatically detects text fields, checkboxes, dropdowns, and radio buttons.' },
      { title: 'Interactive Filling', description: 'Fill each field using native HTML inputs mapped to PDF form fields.' },
      { title: 'Form Flattening', description: 'Permanently embed filled values so the form can no longer be edited.' }
    ],
    howToSteps: [
      { title: 'Upload PDF Form', description: 'Select a PDF document containing interactive form fields.' },
      { title: 'Fill Fields', description: 'Enter values into the detected text fields, checkboxes, and dropdowns.' },
      { title: 'Flatten Form', description: 'Click Fill & Flatten to permanently embed all values.' },
      { title: 'Download Filled PDF', description: 'Save the completed, non-editable document.' }
    ],
    faqs: [
      { question: 'What is form flattening?', answer: 'Flattening converts interactive form fields into static text/graphics, making the filled values permanent and uneditable.' }
    ],
    relatedToolIds: ['edit-pdf', 'sign-pdf', 'protect-pdf', 'pdf-tools']
  },
  {
    id: 'word-to-pdf',
    name: 'WORD to PDF',
    path: '/word-to-pdf',
    category: 'pdf',
    shortDescription: 'Convert Microsoft Word (.docx) documents to PDF format directly in the browser.',
    fullDescription: 'Upload a .docx file and convert it to a clean PDF document. The tool parses the Word document structure, renders the content with formatting, and generates a downloadable PDF.',
    icon: 'FileText',
    keywords: ['word to pdf', 'docx to pdf', 'convert word to pdf', 'doc to pdf', 'microsoft word pdf'],
    features: [
      { title: 'DOCX Support', description: 'Handles Microsoft Word .docx files with paragraphs, headings, lists, and images.' },
      { title: 'Formatting Preservation', description: 'Maintains bold, italic, headings, and basic document structure.' },
      { title: '100% Client-Side', description: 'Your documents are never uploaded to any server.' }
    ],
    howToSteps: [
      { title: 'Upload DOCX', description: 'Select a Microsoft Word .docx file from your device.' },
      { title: 'Preview Content', description: 'See the rendered document content before conversion.' },
      { title: 'Convert to PDF', description: 'Click Convert to generate the PDF document.' },
      { title: 'Download PDF', description: 'Save the converted PDF file.' }
    ],
    faqs: [
      { question: 'Does this support .doc files?', answer: 'This tool supports .docx format (Office 2007+). Legacy .doc files need to be saved as .docx first.' }
    ],
    relatedToolIds: ['pdf-to-word', 'excel-to-pdf', 'powerpoint-to-pdf', 'pdf-tools']
  },
  {
    id: 'excel-to-pdf',
    name: 'EXCEL to PDF',
    path: '/excel-to-pdf',
    category: 'pdf',
    shortDescription: 'Convert Excel spreadsheets (.xlsx) to formatted PDF documents in the browser.',
    fullDescription: 'Upload an Excel .xlsx file and convert its sheets to a clean PDF document. Each sheet is rendered as a formatted table on its own page. Select which sheets to include in the output.',
    icon: 'Table',
    keywords: ['excel to pdf', 'xlsx to pdf', 'spreadsheet to pdf', 'convert excel to pdf', 'table to pdf'],
    features: [
      { title: 'Multi-Sheet Support', description: 'Select which Excel sheets to include in the PDF output.' },
      { title: 'Table Formatting', description: 'Renders spreadsheet data as clean, bordered tables.' },
      { title: 'Client-Side Processing', description: 'Spreadsheet data never leaves your browser.' }
    ],
    howToSteps: [
      { title: 'Upload XLSX', description: 'Select an Excel .xlsx file.' },
      { title: 'Select Sheets', description: 'Choose which sheets to convert.' },
      { title: 'Convert to PDF', description: 'Click Convert to generate the PDF.' },
      { title: 'Download PDF', description: 'Save the formatted PDF document.' }
    ],
    faqs: [
      { question: 'Are formulas preserved?', answer: 'Cell values (results of formulas) are preserved. The formulas themselves are not included in the PDF output.' }
    ],
    relatedToolIds: ['pdf-to-excel', 'word-to-pdf', 'powerpoint-to-pdf', 'pdf-tools']
  },
  {
    id: 'powerpoint-to-pdf',
    name: 'POWERPOINT to PDF',
    path: '/powerpoint-to-pdf',
    category: 'pdf',
    shortDescription: 'Convert PowerPoint presentations (.pptx) to PDF format in the browser.',
    fullDescription: 'Upload a .pptx file and convert slides to PDF pages. The tool extracts slide content including text, images, and basic layouts. Complex animations and charts may have limited support.',
    icon: 'Presentation',
    keywords: ['powerpoint to pdf', 'pptx to pdf', 'convert ppt to pdf', 'presentation to pdf', 'slides to pdf'],
    features: [
      { title: 'Slide Extraction', description: 'Extracts text and images from each slide.' },
      { title: 'Multi-Slide Output', description: 'Each slide becomes its own page in the PDF.' },
      { title: 'Client-Side Only', description: 'Presentations stay on your device.' }
    ],
    howToSteps: [
      { title: 'Upload PPTX', description: 'Select a PowerPoint .pptx file.' },
      { title: 'Preview Slides', description: 'Review extracted slide content.' },
      { title: 'Convert to PDF', description: 'Click Convert to create the PDF.' },
      { title: 'Download PDF', description: 'Save the presentation as a PDF.' }
    ],
    faqs: [
      { question: 'Are animations and transitions included?', answer: 'No, PDF is a static format. Animations and transitions cannot be represented. Text and images are extracted as static content.' }
    ],
    relatedToolIds: ['pdf-to-powerpoint', 'word-to-pdf', 'excel-to-pdf', 'pdf-tools']
  },
  {
    id: 'pdf-to-word',
    name: 'PDF to WORD',
    path: '/pdf-to-word',
    category: 'pdf',
    shortDescription: 'Convert PDF documents to editable Microsoft Word (.docx) format.',
    fullDescription: 'Extract text and images from PDF pages and compile them into a Microsoft Word .docx file. Pages can be embedded as images for layout preservation or as extracted text for editability.',
    icon: 'FileOutput',
    keywords: ['pdf to word', 'pdf to docx', 'convert pdf to word', 'pdf to doc', 'editable word from pdf'],
    features: [
      { title: 'Text Extraction', description: 'Extracts searchable text from PDF pages using PDF.js.' },
      { title: 'Image Preservation', description: 'Pages can be embedded as images to preserve exact layout.' },
      { title: 'DOCX Generation', description: 'Creates standard .docx files compatible with Microsoft Word.' }
    ],
    howToSteps: [
      { title: 'Upload PDF', description: 'Select the PDF document to convert.' },
      { title: 'Choose Mode', description: 'Select text extraction or image-based conversion.' },
      { title: 'Convert to DOCX', description: 'Click Convert to generate the Word document.' },
      { title: 'Download DOCX', description: 'Save the editable Word file.' }
    ],
    faqs: [
      { question: 'Will the formatting match exactly?', answer: 'Text content is extracted accurately. Complex layouts with multiple columns, tables, and graphics may need manual adjustment in Word.' }
    ],
    relatedToolIds: ['word-to-pdf', 'pdf-to-excel', 'pdf-to-powerpoint', 'pdf-tools']
  },
  {
    id: 'pdf-to-excel',
    name: 'PDF to EXCEL',
    path: '/pdf-to-excel',
    category: 'pdf',
    shortDescription: 'Extract tabular data from PDF documents into editable Excel (.xlsx) spreadsheets.',
    fullDescription: 'Parse text content from PDF pages, detect table structures by analyzing text positions, and export the data as an Excel .xlsx spreadsheet with proper rows and columns.',
    icon: 'Sheet',
    keywords: ['pdf to excel', 'pdf to xlsx', 'extract table from pdf', 'convert pdf to spreadsheet', 'pdf data extraction'],
    features: [
      { title: 'Table Detection', description: 'Analyzes text positions to detect rows and columns in tabular data.' },
      { title: 'Multi-Page Support', description: 'Processes all pages to find and extract tables.' },
      { title: 'Clean XLSX Output', description: 'Generates standard Excel files with proper cell formatting.' }
    ],
    howToSteps: [
      { title: 'Upload PDF', description: 'Select a PDF containing tabular data.' },
      { title: 'Extract Data', description: 'The tool analyzes and extracts table structures.' },
      { title: 'Review Preview', description: 'Check the extracted data before export.' },
      { title: 'Download XLSX', description: 'Save the data as an Excel spreadsheet.' }
    ],
    faqs: [
      { question: 'What types of PDFs work best?', answer: 'PDFs with clearly structured tables (invoices, reports, data sheets) produce the best results. Scanned images of tables require OCR first.' }
    ],
    relatedToolIds: ['excel-to-pdf', 'pdf-to-word', 'pdf-to-powerpoint', 'pdf-tools']
  },
  {
    id: 'pdf-to-powerpoint',
    name: 'PDF to POWERPOINT',
    path: '/pdf-to-powerpoint',
    category: 'pdf',
    shortDescription: 'Convert PDF pages into a PowerPoint (.pptx) presentation with each page as a slide.',
    fullDescription: 'Transform a PDF document into a PowerPoint presentation. Each PDF page is rendered as a high-resolution image and placed on its own slide, preserving the exact visual layout.',
    icon: 'MonitorPlay',
    keywords: ['pdf to powerpoint', 'pdf to pptx', 'convert pdf to ppt', 'pdf to presentation', 'pdf to slides'],
    features: [
      { title: 'Page-to-Slide Conversion', description: 'Each PDF page becomes a full-bleed image slide in the presentation.' },
      { title: 'High Resolution', description: 'Pages are rendered at 2x scale for crisp projection quality.' },
      { title: 'Standard PPTX', description: 'Output is compatible with PowerPoint, Google Slides, and Keynote.' }
    ],
    howToSteps: [
      { title: 'Upload PDF', description: 'Select the PDF to convert into a presentation.' },
      { title: 'Render Pages', description: 'Wait for all pages to be rendered as high-resolution images.' },
      { title: 'Create Presentation', description: 'Click Convert to build the PowerPoint file.' },
      { title: 'Download PPTX', description: 'Save the presentation to your device.' }
    ],
    faqs: [
      { question: 'Can I edit the text in the slides?', answer: 'Pages are embedded as images for exact layout preservation. To edit text, use the PDF to Word tool instead.' }
    ],
    relatedToolIds: ['powerpoint-to-pdf', 'pdf-to-word', 'pdf-to-jpg', 'pdf-tools']
  },
  {
    id: 'ocr-pdf',
    name: 'OCR PDF',
    path: '/ocr-pdf',
    category: 'pdf',
    shortDescription: 'Extract text from scanned PDF documents using optical character recognition (OCR).',
    fullDescription: 'Convert scanned PDF documents into searchable text using Tesseract.js OCR engine running entirely in your browser. Extract text from image-based PDFs without uploading to any server.',
    icon: 'ScanSearch',
    keywords: ['ocr pdf', 'pdf ocr', 'extract text from scanned pdf', 'searchable pdf', 'text recognition pdf', 'optical character recognition'],
    features: [
      { title: 'Browser-Based OCR', description: 'Uses Tesseract.js WebAssembly engine — no server uploads required.' },
      { title: 'Multi-Page Processing', description: 'Processes every page and combines extracted text.' },
      { title: 'Copy & Download Text', description: 'Copy recognized text to clipboard or download as a .txt file.' }
    ],
    howToSteps: [
      { title: 'Upload Scanned PDF', description: 'Select a PDF containing scanned images or photos of text.' },
      { title: 'Run OCR', description: 'Click Recognize Text to start optical character recognition.' },
      { title: 'Review Extracted Text', description: 'Check the recognized text for accuracy.' },
      { title: 'Copy or Download', description: 'Copy text to clipboard or download as a text file.' }
    ],
    faqs: [
      { question: 'How accurate is the OCR?', answer: 'Accuracy depends on image quality. Clear, high-resolution scans typically achieve 90-98% accuracy. Blurry or low-contrast images may produce lower accuracy.' },
      { question: 'What languages are supported?', answer: 'English is loaded by default. The OCR engine supports 100+ languages through Tesseract.js language packs.' }
    ],
    relatedToolIds: ['pdf-to-word', 'pdf-to-excel', 'scan-to-pdf', 'pdf-tools']
  },

  // --- TEXT TOOLS ---
  {
    id: 'word-counter',
    name: 'Word Counter',
    path: '/word-counter',
    category: 'text',
    shortDescription: 'Real-time word, character, sentence, paragraph, and reading time counter with keyword analysis.',
    fullDescription: 'Comprehensive text analysis utility for writers, students, and SEO professionals. Calculate word count, characters with/without spaces, sentences, paragraphs, estimated reading & speaking time, and top keyword frequencies in real time.',
    icon: 'AlignLeft',
    isPopular: true,
    badge: 'Popular',
    keywords: ['word counter', 'count words', 'character counter', 'word count tool', 'reading time calculator', 'keyword density', 'sentence counter', 'text statistics'],
    features: [
      { title: 'Live Instant Updates', description: 'Metrics update instantaneously as you type or paste text into the workspace.' },
      { title: 'Reading & Speaking Time', description: 'Accurate estimates based on average reading (200 wpm) and speaking (130 wpm) speeds.' },
      { title: 'Keyword Density Analyzer', description: 'Displays the most frequent 1-word and 2-word terms with percentage density.' },
      { title: 'Comprehensive Metrics', description: 'Tracks words, characters (with & without spaces), sentences, and paragraphs.' }
    ],
    howToSteps: [
      { title: 'Type or Paste Text', description: 'Enter or paste your content directly into the large text area.' },
      { title: 'Read Real-Time Metrics', description: 'Watch the live stats update automatically above and beside your text.' },
      { title: 'Analyze Keyword Density', description: 'Inspect keyword frequencies to optimize for SEO or readability.' },
      { title: 'Copy or Clear', description: 'Use quick action buttons to copy your text or clear the editor.' }
    ],
    faqs: [
      { question: 'How is reading time calculated?', answer: 'Reading time is calculated using the widely accepted average silent reading benchmark of 200 words per minute.' },
      { question: 'Is my text stored anywhere?', answer: 'No. Everything stays in your browser memory. We never store or log your writing.' }
    ],
    relatedToolIds: ['character-counter', 'case-converter', 'qr-code-generator']
  },
  {
    id: 'character-counter',
    name: 'Character Counter',
    path: '/character-counter',
    category: 'text',
    shortDescription: 'Track characters and words with live limit progress bars for Twitter/X, LinkedIn, Instagram, and SMS.',
    fullDescription: 'Precise character count tool tailored for social media creators and copywriters. Monitor character limits for Twitter/X (280), Instagram (2200), LinkedIn (3000), SMS (160), YouTube titles, and meta descriptions with live progress bars.',
    icon: 'Hash',
    isPopular: true,
    keywords: ['character counter', 'char count', 'twitter character count', 'social media character limit', 'tweet counter', 'sms length calculator', 'meta description counter'],
    features: [
      { title: 'Social Media Limit Gauges', description: 'Visual progress meters for X (Twitter), LinkedIn, Instagram, Facebook, and SMS.' },
      { title: 'Over-Limit Warnings', description: 'Instant color-coded indicators when your text exceeds platform character thresholds.' },
      { title: 'Whitespace Differentiation', description: 'View counts both including and excluding whitespace and line breaks.' }
    ],
    howToSteps: [
      { title: 'Paste Your Copy', description: 'Type or paste your post, caption, or meta description into the editor.' },
      { title: 'Check Platform Limits', description: 'Review the colored progress bars for each major social platform.' },
      { title: 'Fine-Tune Length', description: 'Edit your copy until all target platforms show green checks.' },
      { title: 'Copy Post', description: 'Click "Copy" to paste directly into your social media schedule.' }
    ],
    faqs: [
      { question: 'What is the character limit for Twitter / X?', answer: 'Standard X (Twitter) posts allow up to 280 characters. ToolBoxX displays remaining characters in real-time.' },
      { question: 'What is the SMS character limit per segment?', answer: 'A single standard SMS segment is 160 characters (GSM-7 encoding). Longer messages are split into 153-character concatenated segments.' }
    ],
    relatedToolIds: ['word-counter', 'case-converter', 'qr-code-generator']
  },
  {
    id: 'case-converter',
    name: 'Case Converter',
    path: '/case-converter',
    category: 'text',
    shortDescription: 'Convert text between UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case, and kebab-case.',
    fullDescription: 'Instant text case transformer. Switch text between 10+ case styles including UPPERCASE, lowercase, Title Case, Sentence case, Capitalized Case, camelCase, PascalCase, snake_case, kebab-case, and CONSTANT_CASE with one click.',
    icon: 'Type',
    isPopular: true,
    keywords: ['case converter', 'uppercase to lowercase', 'title case converter', 'sentence case', 'camelcase converter', 'snake_case', 'kebab-case', 'capital letters generator', 'text transform'],
    features: [
      { title: '12 Popular Text Cases', description: 'Sentence case, Title Case, UPPERCASE, lowercase, Capitalized, camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, dot.case, and Alternating cAsE.' },
      { title: 'One-Click Copy & Export', description: 'Copy converted text to clipboard or download as a .txt file immediately.' },
      { title: 'Undo / Redo History', description: 'Easily revert conversions with built-in action history.' }
    ],
    howToSteps: [
      { title: 'Enter Text', description: 'Paste or type your unformatted text in the input field.' },
      { title: 'Click Desired Case', description: 'Select any case button (e.g. "Title Case", "snake_case", "UPPERCASE").' },
      { title: 'Review Transformation', description: 'The text updates instantly to the selected convention.' },
      { title: 'Copy Result', description: 'Click "Copy to Clipboard" to use your converted text.' }
    ],
    faqs: [
      { question: 'What is the difference between Title Case and Capitalized Case?', answer: 'Title Case capitalizes primary words while keeping minor words (like "in", "the", "of", "and") lowercase. Capitalized Case capitalizes the first letter of every single word.' },
      { question: 'What are snake_case and camelCase used for?', answer: 'snake_case (all_lowercase_with_underscores) and camelCase (lowercaseFirstThenCapitalized) are standard naming conventions in programming languages like Python, JavaScript, and Java.' }
    ],
    relatedToolIds: ['word-counter', 'character-counter', 'qr-code-generator']
  },
  {
    id: 'text-to-handwriting',
    name: 'Text to Handwriting Converter',
    path: '/text-to-handwriting',
    category: 'text',
    shortDescription: 'Convert typed text into realistic human handwriting with customizable cursive fonts, lined notebook paper, and ink colors.',
    fullDescription: 'Transform digital text, notes, assignments, and letters into authentic handwritten documents. Choose between 7 realistic handwriting fonts (natural notes, casual script, cursive, calligraphy, ballpoint pen), 5 paper backgrounds (lined notebook, legal pad, grid, vintage parchment), and realistic ink colors. Export to high-resolution PNG or printable multi-page PDF.',
    icon: 'PenTool',
    isPopular: true,
    badge: 'New',
    keywords: ['text to handwriting', 'handwriting generator', 'convert text to handwriting', 'fake handwriting generator', 'assignment handwriting', 'cursive font generator', 'handwritten notes maker', 'lined paper text'],
    features: [
      { title: '7 Realistic Handwriting Styles', description: 'Natural student notes, neat cursive, casual script, architect draft, and calligraphy fonts.' },
      { title: 'Authentic Paper Textures', description: 'Ruled notebook paper with red margins, yellow legal pad, grid paper, vintage parchment, and plain white.' },
      { title: 'Custom Ink & Spacing', description: 'Adjust ink colors (blue, black, red, purple), font size, line height, and margin offsets.' },
      { title: 'Direct PDF & PNG Export', description: 'Download your realistic handwritten page as high-res PNG or printable PDF document.' }
    ],
    howToSteps: [
      { title: 'Enter Text', description: 'Type or paste your content in the editor.' },
      { title: 'Pick Handwriting Style', description: 'Select your preferred natural handwriting or cursive font.' },
      { title: 'Choose Paper & Ink', description: 'Select notebook lines, legal pad yellow, or parchment with blue or black ink.' },
      { title: 'Download Output', description: 'Export your authentic handwritten page as PNG image or PDF.' }
    ],
    faqs: [
      { question: 'Can I export the handwritten text to PDF?', answer: 'Yes! You can download your handwritten notes as a standard A4 PDF document or high-resolution PNG image ready to print or submit.' },
      { question: 'Is my text processed privately?', answer: 'Yes. All handwriting generation and canvas rendering occurs 100% locally inside your browser.' }
    ],
    relatedToolIds: ['word-counter', 'case-converter', 'qr-code-generator', 'pdf-tools']
  },

  // --- GENERATORS ---
  {
    id: 'qr-code-generator',
    name: 'QR Code Generator',
    path: '/qr-code-generator',
    category: 'generators',
    shortDescription: 'Generate custom QR codes for URLs, text, Wi-Fi passwords, emails, and phone numbers with custom colors and SVG/PNG download.',
    fullDescription: 'Create high-resolution, scannable QR codes in seconds. Supports websites, Wi-Fi networks (SSID & WPA/WEP password), email messages, phone dials, SMS, and plain text. Customize foreground & background colors, select error correction levels, and download in vector SVG or crisp PNG format.',
    icon: 'QrCode',
    isPopular: true,
    badge: 'Popular',
    keywords: ['qr code generator', 'create qr code', 'wifi qr code', 'free qr code', 'custom qr code', 'qr code svg', 'qr code png', 'barcode generator'],
    features: [
      { title: '6 Input Data Types', description: 'Generate QR codes for URLs, Plain Text, Wi-Fi Credentials, Email (mailto), Phone Call, and SMS.' },
      { title: 'Custom Colors & Styling', description: 'Pick custom foreground and background colors with real-time contrast check.' },
      { title: 'Error Correction Levels', description: 'Choose from Low (7%), Medium (15%), Quartile (25%), or High (30%) error recovery.' },
      { title: 'Vector SVG & Raster PNG Export', description: 'Download scalable vector SVG for print design or high-resolution PNG for digital use.' }
    ],
    howToSteps: [
      { title: 'Choose Content Type', description: 'Select URL, Text, Wi-Fi, Email, Phone, or SMS.' },
      { title: 'Fill In Information', description: 'Type the destination link or Wi-Fi network details.' },
      { title: 'Customize Visuals', description: 'Choose your preferred brand colors and error correction level.' },
      { title: 'Download QR Code', description: 'Click Download PNG or Download SVG to save your code.' }
    ],
    faqs: [
      { question: 'Do these QR codes expire?', answer: 'No! The QR codes generated on ToolBoxX are static and directly encode your data. They never expire and have zero monthly fees.' },
      { question: 'How do Wi-Fi QR codes work?', answer: 'When guests scan a Wi-Fi QR code with their phone camera, they are prompted to automatically connect to the network without typing the password.' },
      { question: 'What error correction level should I choose?', answer: 'Medium (15%) or Quartile (25%) is ideal for most applications. High (30%) is best if you plan to print the QR code in outdoor environments or overlay an icon.' }
    ],
    relatedToolIds: ['image-resizer', 'word-counter', 'case-converter']
  }
];

export const CATEGORIES = [
  { id: 'images', name: 'Image Tools', icon: 'Image', description: 'Compress, resize, and convert images directly in your browser with zero quality compromise.' },
  { id: 'pdf', name: 'PDF Tools', icon: 'FileText', description: 'Merge, split, compress, extract pages, and convert PDFs locally without uploading to any server.' },
  { id: 'text', name: 'Text Tools', icon: 'Type', description: 'Count words, track character limits for social media, and convert case formats effortlessly.' },
  { id: 'generators', name: 'Generators', icon: 'QrCode', description: 'Create customizable QR codes for links, Wi-Fi passwords, contact details, and plain text.' }
] as const;

export function getToolById(id: string): ToolMeta | undefined {
  return TOOLS_DATA.find(t => t.id === id || t.path === `/${id}`);
}

export function getToolsByCategory(category: string): ToolMeta[] {
  return TOOLS_DATA.filter(t => t.category === category);
}

export function getPopularTools(): ToolMeta[] {
  return TOOLS_DATA.filter(t => t.isPopular);
}

export function getRecentTools(): ToolMeta[] {
  return TOOLS_DATA.filter(t => t.isRecent || t.isPopular).slice(0, 4);
}

export function searchTools(query: string): ToolMeta[] {
  if (!query || query.trim() === '') return TOOLS_DATA;
  const clean = query.toLowerCase().trim();
  
  return TOOLS_DATA.filter(tool => {
    if (tool.name.toLowerCase().includes(clean)) return true;
    if (tool.shortDescription.toLowerCase().includes(clean)) return true;
    if (tool.category.toLowerCase().includes(clean)) return true;
    if (tool.keywords.some(k => k.toLowerCase().includes(clean) || clean.includes(k.toLowerCase()))) return true;
    return false;
  });
}
