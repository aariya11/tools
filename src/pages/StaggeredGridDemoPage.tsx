import { StaggeredGrid, type BentoItem } from '../components/common/StaggeredGrid';
import { FaCode, FaRocket, FaPalette } from 'react-icons/fa';

export const StaggeredGridDemoPage: React.FC = () => {
  const images = [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&auto=format&fit=crop&q=80',
  ];

  const bentoItems: BentoItem[] = [
    {
      id: 1,
      title: 'Performance',
      subtitle: 'Lightning Fast',
      description: 'Engineered for smooth 60fps animations.',
      icon: <FaRocket className="w-5 h-5" />,
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 2,
      title: 'Clean Code',
      subtitle: 'TypeScript & GSAP',
      description: 'Modern component architecture.',
      icon: <FaCode className="w-5 h-5" />,
      image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 3,
      title: 'Aesthetic',
      subtitle: 'Tailwind Design',
      description: 'Carefully styled dark and modern surfaces.',
      icon: <FaPalette className="w-5 h-5" />,
      image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-10">
      <div className="text-center px-4 mb-4">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
          Interactive Demo
        </span>
        <h1 className="text-3xl font-bold tracking-tight">Staggered Grid Animation</h1>
        <p className="text-neutral-400 text-sm mt-2 max-w-lg mx-auto">
          Scroll down to trigger the GSAP ScrollTrigger timeline and hover over cards to inspect the interactive bento expansion.
        </p>
      </div>

      <StaggeredGrid
        images={images}
        bentoItems={bentoItems}
        centerText="HALCYON"
      />

      <div className="h-[40vh] flex items-center justify-center text-neutral-500 text-sm">
        Scroll back up to reverse animations
      </div>
    </div>
  );
};

export default StaggeredGridDemoPage;
