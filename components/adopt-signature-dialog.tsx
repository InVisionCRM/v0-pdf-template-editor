"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SignatureCanvas from "./signature-canvas"; // Assuming this is in the same directory or adjust path
import InitialsCanvas from "./initials-canvas"; // Assuming this is in the same directory or adjust path
import { CheckCircle } from "lucide-react";
import { Stage, Layer, Text } from "react-konva";
import Konva from "konva";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// Ensure the 'Caveat' font is globally available, e.g., imported in your main CSS file or layout.
// @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap');

interface AdoptSignatureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdopt: (signature: string, initials?: string) => void;
  initialSignature?: string; // To pre-fill drawn signature
  initialInitials?: string; // To pre-fill drawn initials
  title?: string;
  needsInitials?: boolean;
}

export default function AdoptSignatureDialog({
  open,
  onOpenChange,
  onAdopt,
  initialSignature = "",
  initialInitials = "",
  title = "Adopt your signature",
  needsInitials = true,
}: AdoptSignatureDialogProps) {
  const [signatureMode, setSignatureMode] = useState<"draw" | "type">("draw");
  const [typedFullName, setTypedFullName] = useState<string>("");
  const [typedInitials, setTypedInitials] = useState<string>("");

  const [localMasterSignature, setLocalMasterSignature] = useState<string>(initialSignature);
  const [localMasterInitials, setLocalMasterInitials] = useState<string>(needsInitials ? initialInitials : "N/A"); // Use N/A if not needed
  
  const [hasSetupSignature, setHasSetupSignature] = useState(false);

  const signatureStageRef = useRef<Konva.Stage>(null);
  const initialsStageRef = useRef<Konva.Stage>(null);

  // Effect to initialize localMasterSignature and localMasterInitials from props when dialog opens or mode changes
  useEffect(() => {
    if (open) {
      setLocalMasterSignature(initialSignature);
      if (needsInitials) {
        setLocalMasterInitials(initialInitials);
      } else {
        setLocalMasterInitials("N/A"); // Mark as N/A if not needed for logic
      }
      // Reset typed fields when dialog opens
      setTypedFullName("");
      setTypedInitials("");
    }
  }, [open, initialSignature, initialInitials, needsInitials]);
  

  const handleSignatureSetup = useCallback((signature: string) => {
    setLocalMasterSignature(signature);
  }, []);

  const handleInitialsSetup = useCallback((initials: string) => {
    if (needsInitials) {
      setLocalMasterInitials(initials);
    }
  }, [needsInitials]);

  // Update localMasterSignature when typedFullName changes in 'type' mode
  useEffect(() => {
    if (signatureMode === "type" && signatureStageRef.current && typedFullName) {
      const stage = signatureStageRef.current;
      const textNode = stage.findOne("Text") as Konva.Text;
      if (textNode) {
        const originalFill = textNode.fill();
        textNode.fill("#000000"); // Set to black for data URL
        stage.getLayers()[0]?.draw();
        const dataURL = stage.toDataURL();
        setLocalMasterSignature(dataURL);
        textNode.fill(originalFill); // Restore original fill
        stage.getLayers()[0]?.draw();
      } else {
         // Fallback for initial render or if textNode isn't ready
        const tempStage = new Konva.Stage({ container: document.createElement('div'), width: 300, height: 120 });
        const layer = new Konva.Layer();
        const tempTextNode = new Konva.Text({
            text: typedFullName,
            fontFamily: "Caveat, cursive",
            fontSize: 48,
            fill: "#000000", // black for dataURL
            width: 300,
            height: 120,
            padding: 10,
            align: "center",
            verticalAlign: "middle",
        });
        layer.add(tempTextNode);
        tempStage.add(layer);
        setLocalMasterSignature(tempStage.toDataURL());
        tempStage.destroy();
      }
    } else if (signatureMode === "type" && !typedFullName) {
        setLocalMasterSignature(""); // Clear if name is erased
    }
  }, [typedFullName, signatureMode]);

  // Update localMasterInitials when typedInitials changes in 'type' mode
  useEffect(() => {
    if (needsInitials && signatureMode === "type" && initialsStageRef.current && typedInitials) {
      const stage = initialsStageRef.current;
      const textNode = stage.findOne("Text") as Konva.Text;
      if (textNode) {
        const originalFill = textNode.fill();
        textNode.fill("#000000");
        stage.getLayers()[0]?.draw();
        const dataURL = stage.toDataURL();
        setLocalMasterInitials(dataURL);
        textNode.fill(originalFill);
        stage.getLayers()[0]?.draw();
      } else {
        // Fallback for initial render
        const tempStage = new Konva.Stage({ container: document.createElement('div'), width: 150, height: 120 });
        const layer = new Konva.Layer();
        const tempTextNode = new Konva.Text({
            text: typedInitials,
            fontFamily: "Caveat, cursive",
            fontSize: 60, // Larger for initials
            fill: "#000000",
            width: 150,
            height: 120,
            padding: 10,
            align: "center",
            verticalAlign: "middle",
        });
        layer.add(tempTextNode);
        tempStage.add(layer);
        setLocalMasterInitials(tempStage.toDataURL());
        tempStage.destroy();
      }
    } else if (needsInitials && signatureMode === "type" && !typedInitials) {
        setLocalMasterInitials(""); // Clear if initials are erased
    }
  }, [typedInitials, signatureMode, needsInitials]);
  
  // Determine if signature/initials are set up
  useEffect(() => {
    const sigReady = !!localMasterSignature && localMasterSignature !== "data:,";
    const initialsReady = !needsInitials || (!!localMasterInitials && localMasterInitials !== "data:,");
    setHasSetupSignature(sigReady && initialsReady);
  }, [localMasterSignature, localMasterInitials, needsInitials, signatureMode]);


  // Reset local signatures when mode changes or dialog opens/closes
  useEffect(() => {
    if (open) {
      // When switching to draw, if props were provided, use them. Otherwise, clear.
      if (signatureMode === 'draw') {
        setLocalMasterSignature(initialSignature || "");
        if (needsInitials) {
          setLocalMasterInitials(initialInitials || "");
        }
      } else { // Switching to type mode
        // If typed fields have values, useEffects for typedFullName/typedInitials will update signatures.
        // If typed fields are empty, clear the signatures.
        if (!typedFullName) setLocalMasterSignature("");
        if (needsInitials && !typedInitials) setLocalMasterInitials("");
      }
    }
  }, [signatureMode, open, initialSignature, initialInitials, needsInitials, typedFullName, typedInitials]);


  const handleAdoptAndSign = () => {
    if (hasSetupSignature) {
      onAdopt(localMasterSignature, needsInitials ? localMasterInitials : undefined);
      onOpenChange(false); // Close dialog on adopt
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };
  
    // Effect to clear drawn signatures when switching to type mode, and typed signatures when switching to draw
    useEffect(() => {
        if (signatureMode === 'type') {
            // If there are typed values, they will generate new signatures.
            // If not, effectively clear them for this mode by setting to empty.
            if (!typedFullName) setLocalMasterSignature("");
            if (needsInitials && !typedInitials) setLocalMasterInitials("");
        } else { // signatureMode === 'draw'
            // Restore initial drawn signatures or clear if none were provided
            setLocalMasterSignature(initialSignature || "");
             if (needsInitials) {
                setLocalMasterInitials(initialInitials || "");
            }
        }
  }, [signatureMode, initialSignature, initialInitials, needsInitials, typedFullName, typedInitials]);


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] bg-gray-800 text-white border-gray-700 p-0">
        <DialogHeader className="p-6 pb-4 border-b border-gray-700">
          <DialogTitle className="text-white text-xl">{title}</DialogTitle>
          <DialogDescription className="text-gray-400 text-sm pt-1">
            Confirm your name{needsInitials ? ", initials," : ""} and signature.
          </DialogDescription>
          <div className="flex space-x-2 mt-4">
            <Button
              variant={signatureMode === "draw" ? "secondary" : "ghost"}
              onClick={() => setSignatureMode("draw")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                signatureMode === "draw"
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white"
              }`}
            >
              Draw
            </Button>
            <Button
              variant={signatureMode === "type" ? "secondary" : "ghost"}
              onClick={() => setSignatureMode("type")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                signatureMode === "type"
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white"
              }`}
            >
              Type
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {signatureMode === "draw" ? (
            <React.Fragment>
              <div className="space-y-2">
                <Label htmlFor="dialogMasterSignature" className="text-gray-300">
                  Your Signature (draw)
                </Label>
                <SignatureCanvas
                  value={localMasterSignature}
                  onChange={handleSignatureSetup}
                />
              </div>
              {needsInitials && (
                <div className="space-y-2">
                  <Label htmlFor="dialogMasterInitials" className="text-gray-300">
                    Your Initials (draw)
                  </Label>
                  <InitialsCanvas
                    value={localMasterInitials}
                    onChange={handleInitialsSetup}
                  />
                </div>
              )}
            </React.Fragment>
          ) : (
            <div className={`grid grid-cols-1 ${needsInitials ? "md:grid-cols-2" : ""} gap-x-6 gap-y-4`}>
              {/* Column 1: Full Name & Signature Preview */}
              <div className="space-y-2">
                <Label htmlFor="typedFullName" className="text-gray-300 text-sm font-medium">
                  Your full name
                </Label>
                <Input
                  id="typedFullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={typedFullName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTypedFullName(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm rounded-md h-12"
                />
                <Label className="text-gray-400 text-xs pt-1">Signature preview</Label>
                <div className="mt-1 w-full h-[128px] border border-gray-600 rounded-md bg-gray-900 flex items-center justify-center overflow-hidden">
                  <Stage
                    ref={signatureStageRef}
                    width={300}
                    height={120}
                    className="bg-gray-900"
                  >
                    <Layer>
                      <Text
                        text={typedFullName}
                        fontFamily="Caveat, cursive"
                        fontSize={48}
                        fill="#FFFFFF"
                        width={300}
                        height={120}
                        padding={10}
                        align="center"
                        verticalAlign="middle"
                        perfectDrawEnabled={false} // Keep as false unless specific needs arise
                      />
                    </Layer>
                  </Stage>
                </div>
              </div>

              {/* Column 2: Initials & Initials Preview (conditional) */}
              {needsInitials && (
                <div className="space-y-2">
                  <Label htmlFor="typedInitials" className="text-gray-300 text-sm font-medium">
                    Your initials
                  </Label>
                  <Input
                    id="typedInitials"
                    type="text"
                    placeholder="Enter your initials"
                    value={typedInitials}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTypedInitials(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm rounded-md h-12"
                    maxLength={5}
                  />
                  <Label className="text-gray-400 text-xs pt-1">Initials preview</Label>
                  <div className="mt-1 w-full h-[128px] border border-gray-600 rounded-md bg-gray-900 flex items-center justify-center overflow-hidden">
                    <Stage
                      ref={initialsStageRef}
                      width={150}
                      height={120}
                      className="bg-gray-900"
                    >
                      <Layer>
                        <Text
                          text={typedInitials}
                          fontFamily="Caveat, cursive"
                          fontSize={60}
                          fill="#FFFFFF"
                          width={150}
                          height={120}
                          padding={10}
                          align="center"
                          verticalAlign="middle"
                          perfectDrawEnabled={false}
                        />
                      </Layer>
                    </Stage>
                  </div>
                </div>
              )}
            </div>
          )}

          {hasSetupSignature && (
            <div className="flex items-center text-green-400 pt-4">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>
                Signature {needsInitials ? "and initials" : ""} ready!
              </span>
            </div>
          )}
          <p className="text-xs text-gray-500 pt-4">
            By clicking Adopt and sign, I agree that the name, signature{needsInitials ? " and initials" : ""} above may be used to
            electronically sign documents. When placing this signature on any document,
            I agree to be bound by the terms of that document.
          </p>
        </div>

        <DialogFooter className="p-6 pt-4 border-t border-gray-700">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="px-4 py-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white focus:ring-gray-500"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAdoptAndSign}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 disabled:opacity-50"
            disabled={!hasSetupSignature}
          >
            Adopt and sign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

AdoptSignatureDialog.displayName = "AdoptSignatureDialog"; 