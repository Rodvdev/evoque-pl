'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LandingZoneConfig } from '@/components/render/section/models/scroll/types';

interface LandingZoneEditorProps {
  config: LandingZoneConfig;
  onChange: (config: LandingZoneConfig) => void;
}

export function LandingZoneEditor({ config, onChange }: LandingZoneEditorProps) {
  const updateConfig = (updates: Partial<LandingZoneConfig>) => {
    onChange({ ...config, ...updates });
  };

  const updatePadding = (updates: Partial<NonNullable<LandingZoneConfig['padding']>>) => {
    const padding = { ...config.padding, ...updates };
    onChange({ ...config, padding });
  };

  const backgroundColor = config.backgroundColor ?? 'transparent';
  const backgroundColorSwatch = backgroundColor.startsWith('#') ? backgroundColor : '#ffffff';
  const titleColor = config.titleColor ?? '#0A1F44';
  const titleColorSwatch = titleColor.startsWith('#') ? titleColor : '#0A1F44';

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <h3 className="text-sm font-semibold text-gray-700">Landing Zone Configuration</h3>

      <div className="flex items-center justify-between">
        <Label htmlFor="landingzone-enabled">Enable Landing Zone</Label>
        <Switch
          id="landingzone-enabled"
          checked={config.enabled ?? false}
          onCheckedChange={(checked) => updateConfig({ enabled: checked })}
        />
      </div>

      {(config.enabled ?? false) && (
        <>
          <div className="space-y-2">
            <Label htmlFor="landingzone-height">Height (vh)</Label>
            <Input
              id="landingzone-height"
              type="number"
              min={10}
              max={50}
              value={(config.height ?? 20).toString()}
              onChange={(e) => updateConfig({ height: Number(e.target.value) || 20 })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="landingzone-bgcolor">Background Color</Label>
            <div className="flex gap-2">
              <Input
                id="landingzone-bgcolor"
                type="color"
                value={backgroundColorSwatch}
                onChange={(e) => updateConfig({ backgroundColor: e.target.value })}
                className="w-20"
              />
              <Input
                type="text"
                value={config.backgroundColor ?? 'transparent'}
                onChange={(e) => updateConfig({ backgroundColor: e.target.value })}
                placeholder="transparent"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="landingzone-showtitle">Show Placeholder Title</Label>
            <Switch
              id="landingzone-showtitle"
              checked={config.showTitle ?? false}
              onCheckedChange={(checked) => updateConfig({ showTitle: checked })}
            />
          </div>

          {(config.showTitle ?? false) && (
            <>
              <div className="space-y-2">
                <Label htmlFor="landingzone-titletext">Title Text</Label>
                <Input
                  id="landingzone-titletext"
                  type="text"
                  value={config.titleText ?? ''}
                  onChange={(e) => updateConfig({ titleText: e.target.value })}
                  placeholder="Enter title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="landingzone-titlecolor">Title Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="landingzone-titlecolor"
                    type="color"
                    value={titleColorSwatch}
                    onChange={(e) => updateConfig({ titleColor: e.target.value })}
                    className="w-20"
                  />
                  <Input
                    type="text"
                    value={titleColor}
                    onChange={(e) => updateConfig({ titleColor: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="landingzone-alignment">Alignment</Label>
            <Select
              value={config.alignment ?? 'center'}
              onValueChange={(value) => updateConfig({ alignment: value as 'center' | 'left' | 'right' })}
            >
              <SelectTrigger id="landingzone-alignment">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Padding (rem)</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="landing-padding-top" className="text-xs">Top</Label>
                <Input
                  id="landing-padding-top"
                  type="number"
                  min={0}
                  step={0.5}
                  value={(config.padding?.top ?? 2).toString()}
                  onChange={(e) => updatePadding({ top: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="landing-padding-bottom" className="text-xs">Bottom</Label>
                <Input
                  id="landing-padding-bottom"
                  type="number"
                  min={0}
                  step={0.5}
                  value={(config.padding?.bottom ?? 2).toString()}
                  onChange={(e) => updatePadding({ bottom: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="landing-padding-left" className="text-xs">Left</Label>
                <Input
                  id="landing-padding-left"
                  type="number"
                  min={0}
                  step={0.5}
                  value={(config.padding?.left ?? 4).toString()}
                  onChange={(e) => updatePadding({ left: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="landing-padding-right" className="text-xs">Right</Label>
                <Input
                  id="landing-padding-right"
                  type="number"
                  min={0}
                  step={0.5}
                  value={(config.padding?.right ?? 4).toString()}
                  onChange={(e) => updatePadding({ right: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
