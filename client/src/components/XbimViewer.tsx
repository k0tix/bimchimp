"use client";

import React, { useEffect, useRef, useState } from "react";
import "@xbim/viewer";
import { Viewer, ViewerEventMap, ViewType } from "@xbim/viewer";
import { toast } from "sonner";
import { usePubSub } from "./contexts/pubsub";
import { cn } from "../lib/utils";

interface XbimViewerProps {
  width?: number | string;
  height?: number | string;
  className?: string;
}

type PossibleEvent = keyof ViewerEventMap;
const handledEvents: PossibleEvent[] = [
  "click",
  // "contextmenu",
  // "dblclick",
  // "drag",
  // "dragend",
  // "dragenter",
  // "dragleave",
  // "dragover",
  // "dragstart",
  // "drop",
  // "mousedown",
  // "mouseenter",
  // "mouseleave",
  // "mousemove",
  // "mouseout",
  // "mouseover",
  // "mouseup",
  // "mousewheel",
  // "gotpointercapture",
  // "lostpointercapture",
  // "touchcancel",
  // "touchend",
  // "touchmove",
  // "touchstart",
  // "pointercancel",
  // "pointerdown",
  // "pointerenter",
  // "pointerleave",
  // "pointermove",
  // "pointerout",
  // "pointerover",
  // "pointerup",
  // "wheel",
  // "pick",
  // "hoverpick",
  // "pointerlockchange",
  // "pointerlockerror",
  // "fps",
  // "loaded",
  // "unloaded",
  // "error",
  // "navigationEnd",
  // "navigationStart",
];

const XbimViewer: React.FC<XbimViewerProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const PubSub = usePubSub();

  const [viewer, setViewer] = useState<Viewer | null>(null);
  const [modelId, setModelId] = useState<number | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const newViewer = new Viewer(canvasRef.current.id);
      setViewer(newViewer);

      handledEvents.forEach((event) => {
        newViewer.on(event, (e: any) => {
          console.log(`Event: ${event}`, e);
          PubSub.publish("viewerEvent", { event, data: e });

          if (event === "click") {
            const isProduct = !!e.id;

            if (!isProduct) {
              return;
            }

            const xyz = isProduct
              ? Array.from(e.xyz).map((num: any) => Math.round(num * 100) / 100)
              : "";

            toast("Click event received", {
              description: isProduct
                ? `You clicked at product ${e.id} at ${xyz}`
                : undefined,
              action: {
                label: "Ok",
                onClick: () => {},
              },
            });
          }
        });
      });

      newViewer.on("loaded", (args) => {
        console.log("BIM viewer loaded");
        newViewer.show(ViewType.DEFAULT);

        newViewer.background = [42, 43, 42];
        setModelId(args.model);
      });

      newViewer.start();

      return () => {
        newViewer.stop();
      };
    }
  }, [PubSub]);

  useEffect(() => {
    const loadFileToken = PubSub.subscribe("loadBimFile", (msg, data) => {
      console.log("Loading new file:");
      if (viewer) {
        if (modelId) {
          viewer.unload(modelId);
        }
        viewer.load(data);
      }
    });

    const resetCameraToken = PubSub.subscribe("resetCamera", () => {
      // animate view to default position
      if (viewer && modelId) {
        viewer.zoomTo();
      }
    });

    return () => {
      PubSub.unsubscribe(loadFileToken);
      PubSub.unsubscribe(resetCameraToken);
    };
  }, [PubSub, viewer, modelId]);

  return (
    <>
      {!modelId && (
        <div className="flex items-center justify-center h-full">
          No model loaded
        </div>
      )}
      <canvas className={cn(className)} id="viewer" ref={canvasRef}></canvas>
    </>
  );
};

export default XbimViewer;
