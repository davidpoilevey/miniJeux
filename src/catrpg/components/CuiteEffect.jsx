// components/CuiteEffect.jsx
import { useEffect, useRef, useState } from 'react';
import { Layer, Image as KonvaImage } from 'react-konva';
import Konva from 'konva';

const CuiteEffect = ({ stageRef, active }) => {
  const [imageNode, setImageNode] = useState(null);
  const [frame, setFrame] = useState(null);
  const imageRef = useRef();
  const wobbleRef = useRef(0);

  useEffect(() => {
    if (!active || !stageRef.current) return;

    const stage = stageRef.current;
    const canvas = stage.toCanvas({ pixelRatio: 1 });
    const img = new window.Image();
    img.src = canvas.toDataURL();
    img.onload = () => {
      setFrame(img);
    };
  }, [active, stageRef]);

  useEffect(() => {
    if (!imageNode || !active) return;

    imageNode.cache();
    imageNode.filters([Konva.Filters.Blur]);
    imageNode.blurRadius(10);
  }, [imageNode, active]);

  useEffect(() => {
    if (!active || !imageRef.current) return;

    const anim = () => {
      if (!imageRef.current) return;
      wobbleRef.current += 0.05;
      const angle = Math.sin(wobbleRef.current) * 0.02; // ± ~1.15°
      imageRef.current.rotation(angle);
      requestAnimationFrame(anim);
    };

    anim();
    return () => {
      if (imageRef.current) imageRef.current.rotation(0);
    };
  }, [active]);

  if (!active || !frame) return null;

  return (
    <Layer listening={false}>
      <KonvaImage
        ref={ref => {
          setImageNode(ref);
          imageRef.current = ref;
        }}
        image={frame}
        x={0}
        y={0}
        width={frame.width}
        height={frame.height}
        opacity={0.9}
      />
    </Layer>
  );
};

export default CuiteEffect;
