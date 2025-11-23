import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, Box } from '@react-three/drei';
import { useRef } from 'react';

const AudioSource = ({ position, color }) => {
  const meshRef = useRef();

  return (
    <group position={position}>
      <Sphere args={[0.5, 32, 32]} ref={meshRef}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </Sphere>
      {/* Visual ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.6, 0.7, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
    </group>
  );
};

const Listener = () => {
  return (
    <group position={[0, 0, 0]}>
      <Box args={[0.5, 0.8, 0.5]}>
        <meshStandardMaterial color="#10b981" />
      </Box>
      {/* Direction indicator */}
      <mesh position={[0, 0, -0.5]}>
        <coneGeometry args={[0.2, 0.5, 8]} />
        <meshStandardMaterial color="#10b981" />
      </mesh>
    </group>
  );
};

const SpatialCanvas = ({ audioSources = [] }) => {
  return (
    <div className="w-full h-[500px] bg-gray-900 rounded-lg overflow-hidden">
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        {/* Grid */}
        <gridHelper args={[20, 20, '#444', '#222']} />
        
        {/* Listener (user/microphone) */}
        <Listener />
        
        {/* Audio Sources */}
        {audioSources.map((source, index) => (
          <AudioSource
            key={index}
            position={source.position || [2, 0, 2]}
            color={source.color || '#3b82f6'}
          />
        ))}
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
      
      <div className="absolute bottom-4 left-4 bg-black/70 text-white p-3 rounded-lg text-sm">
        <p className="font-semibold mb-1">3D Spatial Audio Visualization</p>
        <p className="text-gray-300 text-xs">Green: Listener | Blue: Audio Sources</p>
        <p className="text-gray-400 text-xs mt-1">Drag to rotate • Scroll to zoom</p>
      </div>
    </div>
  );
};

export default SpatialCanvas;