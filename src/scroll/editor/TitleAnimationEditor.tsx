'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollConfig } from '@/components/render/section/models/scroll/types';

type TitleAnimationConfig = NonNullable<ScrollConfig['titleAnimation']>;

interface TitleAnimationEditorProps {
  config?: TitleAnimationConfig;
  onChange: (config: TitleAnimationConfig) => void;
}

const defaultConfig: TitleAnimationConfig = {
  enabled: true,
  variant: 'scale-down',
  initialBackground: 'linear-gradient(135deg, #0A1F44 0%, #1a3a6b 50%, #2c5aa0 100%)',
  finalBackground: 'linear-gradient(to bottom right, #eff6ff, #ffffff)',
  cloudBackground: '/hero-1.jpg',
  overlayOpacity: 0.04,
  textColor: '#FFFFFF',
  darkTextColor: '#0A1F44',
  initialScale: 1.8,
  pinnedY: '-42vw',
  exitY: '50vh',
  containerHeight: 150
};

export function TitleAnimationEditor({ config, onChange }: TitleAnimationEditorProps) {
  const merged = { ...defaultConfig, ...config };

  const updateConfig = (updates: Partial<TitleAnimationConfig>) => {
    onChange({ ...merged, ...updates });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Title Animation</h3>
        <Switch
          checked={merged.enabled}
          onCheckedChange={(checked) => updateConfig({ enabled: checked })}
        />
      </div>

      {merged.enabled && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title-animation-variant">Variant</Label>
            <Select
              value={merged.variant ?? 'scale-down'}
              onValueChange={(value) => updateConfig({ variant: value as TitleAnimationConfig['variant'] })}
            >
              <SelectTrigger id="title-animation-variant">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scale-down">Scale Down</SelectItem>
                <SelectItem value="simple-fade">Simple Fade</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="title-animation-initial-scale">Initial Scale</Label>
              <Input
                id="title-animation-initial-scale"
                type="number"
                step={0.1}
                value={merged.initialScale ?? 1.0}
                onChange={(e) => updateConfig({ initialScale: Number(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title-animation-container-height">Container Height (vh)</Label>
              <Input
                id="title-animation-container-height"
                type="number"
                min={100}
                max={300}
                value={merged.containerHeight ?? 150}
                onChange={(e) => updateConfig({ containerHeight: Number(e.target.value) || 150 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="title-animation-pinned-y">Pinned Y</Label>
              <Input
                id="title-animation-pinned-y"
                type="text"
                value={merged.pinnedY ?? ''}
                onChange={(e) => updateConfig({ pinnedY: e.target.value })}
                placeholder="-42vw"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title-animation-exit-y">Exit Y</Label>
              <Input
                id="title-animation-exit-y"
                type="text"
                value={merged.exitY ?? ''}
                onChange={(e) => updateConfig({ exitY: e.target.value })}
                placeholder="50vh"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="title-animation-text-color">Text Color (Light)</Label>
              <Input
                id="title-animation-text-color"
                type="color"
                value={merged.textColor ?? '#FFFFFF'}
                onChange={(e) => updateConfig({ textColor: e.target.value })}
                className="w-20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title-animation-dark-text-color">Text Color (Dark)</Label>
              <Input
                id="title-animation-dark-text-color"
                type="color"
                value={merged.darkTextColor ?? '#0A1F44'}
                onChange={(e) => updateConfig({ darkTextColor: e.target.value })}
                className="w-20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="title-animation-overlay-opacity">Overlay Opacity</Label>
              <Input
                id="title-animation-overlay-opacity"
                type="number"
                step={0.01}
                min={0}
                max={1}
                value={merged.overlayOpacity ?? 0}
                onChange={(e) => updateConfig({ overlayOpacity: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title-animation-cloud-background">Cloud Background</Label>
              <Input
                id="title-animation-cloud-background"
                type="text"
                value={merged.cloudBackground ?? ''}
                onChange={(e) => updateConfig({ cloudBackground: e.target.value })}
                placeholder="/hero-1.jpg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title-animation-initial-bg">Initial Background</Label>
            <Textarea
              id="title-animation-initial-bg"
              value={merged.initialBackground ?? ''}
              onChange={(e) => updateConfig({ initialBackground: e.target.value })}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title-animation-final-bg">Final Background</Label>
            <Textarea
              id="title-animation-final-bg"
              value={merged.finalBackground ?? ''}
              onChange={(e) => updateConfig({ finalBackground: e.target.value })}
              rows={2}
            />
          </div>
        </div>
      )}
    </div>
  );
}
