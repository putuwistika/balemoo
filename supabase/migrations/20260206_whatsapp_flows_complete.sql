-- WhatsApp Flows Migration (Complete with Projects table)
-- Created: 2026-02-06
-- Description: Tables for WhatsApp Flow Studio feature

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create projects table if it doesn't exist
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Projects RLS policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'projects' 
    AND policyname = 'Users can view their own projects'
  ) THEN
    CREATE POLICY "Users can view their own projects"
      ON projects FOR SELECT
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'projects' 
    AND policyname = 'Users can insert their own projects'
  ) THEN
    CREATE POLICY "Users can insert their own projects"
      ON projects FOR INSERT
      WITH CHECK (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'projects' 
    AND policyname = 'Users can update their own projects'
  ) THEN
    CREATE POLICY "Users can update their own projects"
      ON projects FOR UPDATE
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'projects' 
    AND policyname = 'Users can delete their own projects'
  ) THEN
    CREATE POLICY "Users can delete their own projects"
      ON projects FOR DELETE
      USING (user_id = auth.uid());
  END IF;
END $$;

-- WhatsApp Flows table
CREATE TABLE IF NOT EXISTS whatsapp_flows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'OTHER',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'deprecated')),
  flow_json JSONB NOT NULL,
  version TEXT NOT NULL DEFAULT '5.0',
  endpoint_uri TEXT,
  flow_id TEXT, -- Meta Flow ID (when published to WhatsApp)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  published_at TIMESTAMPTZ,
  CONSTRAINT valid_category CHECK (
    category IN (
      'SIGN_UP',
      'SIGN_IN', 
      'APPOINTMENT_BOOKING',
      'LEAD_GENERATION',
      'CONTACT_US',
      'CUSTOMER_SUPPORT',
      'SURVEY',
      'OTHER'
    )
  )
);

-- Flow Templates table
CREATE TABLE IF NOT EXISTS whatsapp_flow_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'OTHER',
  thumbnail_url TEXT,
  flow_json JSONB NOT NULL,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_template_category CHECK (
    category IN (
      'SIGN_UP',
      'SIGN_IN',
      'APPOINTMENT_BOOKING', 
      'LEAD_GENERATION',
      'CONTACT_US',
      'CUSTOMER_SUPPORT',
      'SURVEY',
      'OTHER'
    )
  )
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_flows_project_id ON whatsapp_flows(project_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_flows_status ON whatsapp_flows(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_flows_category ON whatsapp_flows(category);
CREATE INDEX IF NOT EXISTS idx_whatsapp_flows_created_by ON whatsapp_flows(created_by);
CREATE INDEX IF NOT EXISTS idx_whatsapp_flow_templates_category ON whatsapp_flow_templates(category);
CREATE INDEX IF NOT EXISTS idx_whatsapp_flow_templates_public ON whatsapp_flow_templates(is_public);

-- Enable RLS
ALTER TABLE whatsapp_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_flow_templates ENABLE ROW LEVEL SECURITY;

-- WhatsApp Flows policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'whatsapp_flows' 
    AND policyname = 'Users can view flows in their projects'
  ) THEN
    CREATE POLICY "Users can view flows in their projects"
      ON whatsapp_flows FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM projects
          WHERE projects.id = whatsapp_flows.project_id
          AND projects.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'whatsapp_flows' 
    AND policyname = 'Users can insert flows in their projects'
  ) THEN
    CREATE POLICY "Users can insert flows in their projects"
      ON whatsapp_flows FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM projects
          WHERE projects.id = whatsapp_flows.project_id
          AND projects.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'whatsapp_flows' 
    AND policyname = 'Users can update flows in their projects'
  ) THEN
    CREATE POLICY "Users can update flows in their projects"
      ON whatsapp_flows FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM projects
          WHERE projects.id = whatsapp_flows.project_id
          AND projects.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'whatsapp_flows' 
    AND policyname = 'Users can delete flows in their projects'
  ) THEN
    CREATE POLICY "Users can delete flows in their projects"
      ON whatsapp_flows FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM projects
          WHERE projects.id = whatsapp_flows.project_id
          AND projects.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Template policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'whatsapp_flow_templates' 
    AND policyname = 'Everyone can view public templates'
  ) THEN
    CREATE POLICY "Everyone can view public templates"
      ON whatsapp_flow_templates FOR SELECT
      USING (is_public = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'whatsapp_flow_templates' 
    AND policyname = 'Authenticated users can view all templates'
  ) THEN
    CREATE POLICY "Authenticated users can view all templates"
      ON whatsapp_flow_templates FOR SELECT
      USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_whatsapp_flow_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at (drop first if exists)
DROP TRIGGER IF EXISTS update_whatsapp_flows_updated_at ON whatsapp_flows;
CREATE TRIGGER update_whatsapp_flows_updated_at
  BEFORE UPDATE ON whatsapp_flows
  FOR EACH ROW
  EXECUTE FUNCTION update_whatsapp_flow_updated_at();

-- Insert default RSVP template (only if not exists)
INSERT INTO whatsapp_flow_templates (name, description, category, flow_json, is_public)
SELECT 
  'RSVP Template',
  'Template untuk RSVP pernikahan atau event dengan konfirmasi kehadiran',
  'OTHER',
  '{
    "version": "5.0",
    "screens": [
      {
        "id": "WELCOME",
        "title": "Welcome",
        "terminal": false,
        "data": {},
        "layout": {
          "type": "SingleColumnLayout",
          "children": [
            {
              "type": "TextHeading",
              "text": "RSVP untuk Pernikahan Kami"
            },
            {
              "type": "TextBody",
              "text": "Mohon isi data kehadiran Anda"
            },
            {
              "type": "Footer",
              "label": "Mulai",
              "on-click-action": {
                "name": "navigate",
                "next": {
                  "type": "screen",
                  "name": "GUEST_INFO"
                },
                "payload": {}
              }
            }
          ]
        }
      },
      {
        "id": "GUEST_INFO",
        "title": "Informasi Tamu",
        "terminal": false,
        "data": {
          "guest_name": {
            "type": "string",
            "__example__": "John Doe"
          },
          "phone": {
            "type": "string",
            "__example__": "+628123456789"
          },
          "email": {
            "type": "string",
            "__example__": "john@example.com"
          }
        },
        "layout": {
          "type": "SingleColumnLayout",
          "children": [
            {
              "type": "TextHeading",
              "text": "Informasi Tamu"
            },
            {
              "type": "TextInput",
              "name": "guest_name",
              "label": "Nama Lengkap",
              "required": true,
              "input-type": "text"
            },
            {
              "type": "TextInput",
              "name": "phone",
              "label": "Nomor Telepon",
              "required": true,
              "input-type": "phone"
            },
            {
              "type": "TextInput",
              "name": "email",
              "label": "Email",
              "required": false,
              "input-type": "email"
            },
            {
              "type": "Footer",
              "label": "Lanjut",
              "on-click-action": {
                "name": "navigate",
                "next": {
                  "type": "screen",
                  "name": "ATTENDANCE"
                },
                "payload": {}
              }
            }
          ]
        }
      },
      {
        "id": "ATTENDANCE",
        "title": "Konfirmasi Kehadiran",
        "terminal": false,
        "data": {
          "attendance": {
            "type": "string",
            "__example__": "yes"
          },
          "guest_count": {
            "type": "number",
            "__example__": 2
          }
        },
        "layout": {
          "type": "SingleColumnLayout",
          "children": [
            {
              "type": "TextHeading",
              "text": "Konfirmasi Kehadiran"
            },
            {
              "type": "RadioButtonsGroup",
              "name": "attendance",
              "label": "Apakah Anda akan hadir?",
              "required": true,
              "data-source": [
                {
                  "id": "yes",
                  "title": "Ya, saya akan hadir"
                },
                {
                  "id": "no",
                  "title": "Maaf, saya tidak bisa hadir"
                }
              ]
            },
            {
              "type": "TextInput",
              "name": "guest_count",
              "label": "Jumlah Tamu",
              "required": false,
              "input-type": "number",
              "helper-text": "Termasuk Anda"
            },
            {
              "type": "Footer",
              "label": "Lanjut",
              "on-click-action": {
                "name": "navigate",
                "next": {
                  "type": "screen",
                  "name": "CONFIRMATION"
                },
                "payload": {}
              }
            }
          ]
        }
      },
      {
        "id": "CONFIRMATION",
        "title": "Konfirmasi",
        "terminal": true,
        "success": true,
        "data": {},
        "layout": {
          "type": "SingleColumnLayout",
          "children": [
            {
              "type": "TextHeading",
              "text": "Terima Kasih!"
            },
            {
              "type": "TextBody",
              "text": "RSVP Anda telah kami terima"
            },
            {
              "type": "TextCaption",
              "text": "Kami tunggu kehadiran Anda"
            },
            {
              "type": "Footer",
              "label": "Selesai",
              "on-click-action": {
                "name": "complete",
                "payload": {
                  "guest_name": "${form.guest_name}",
                  "phone": "${form.phone}",
                  "email": "${form.email}",
                  "attendance": "${form.attendance}",
                  "guest_count": "${form.guest_count}"
                }
              }
            }
          ]
        }
      }
    ]
  }'::jsonb,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM whatsapp_flow_templates WHERE name = 'RSVP Template'
);
