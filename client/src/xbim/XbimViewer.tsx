"use client";

import React, { useEffect, useRef } from "react";
import "@xbim/viewer";
import { Viewer, ViewType } from "@xbim/viewer";

interface XbimViewerProps {
  width?: number | string;
  height?: number | string;
}

const XbimViewer: React.FC<XbimViewerProps> = ({
  width = 500,
  height = 300,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const viewer = new Viewer(canvasRef.current.id);
      viewer.on("loaded", () => {
        viewer.show(ViewType.DEFAULT);
      });
      viewer.load("/space.wexbim");
      viewer.start();

      return () => {
        viewer.stop();
      };
    }
  }, []);

  return (
    <canvas id="viewer" ref={canvasRef} width={width} height={height}></canvas>
  );
};

export default XbimViewer;
