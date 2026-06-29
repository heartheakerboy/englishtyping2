export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string;
          code: string;
          coins_reward: number;
          description: string;
          icon: string;
          metric: string;
          name: string;
          sort_order: number;
          threshold: number;
          xp_reward: number;
        };
        Insert: {
          category?: string;
          code: string;
          coins_reward?: number;
          description: string;
          icon?: string;
          metric?: string;
          name: string;
          sort_order?: number;
          threshold?: number;
          xp_reward?: number;
        };
        Update: {
          category?: string;
          code?: string;
          coins_reward?: number;
          description?: string;
          icon?: string;
          metric?: string;
          name?: string;
          sort_order?: number;
          threshold?: number;
          xp_reward?: number;
        };
        Relationships: [];
      };
      ad_placements: {
        Row: {
          adsense_client: string | null;
          adsense_slot: string | null;
          created_at: string;
          custom_html: string | null;
          id: string;
          is_active: boolean;
          kind: string;
          name: string;
          page_match: string | null;
          slot_key: string;
          updated_at: string;
        };
        Insert: {
          adsense_client?: string | null;
          adsense_slot?: string | null;
          created_at?: string;
          custom_html?: string | null;
          id?: string;
          is_active?: boolean;
          kind?: string;
          name: string;
          page_match?: string | null;
          slot_key: string;
          updated_at?: string;
        };
        Update: {
          adsense_client?: string | null;
          adsense_slot?: string | null;
          created_at?: string;
          custom_html?: string | null;
          id?: string;
          is_active?: boolean;
          kind?: string;
          name?: string;
          page_match?: string | null;
          slot_key?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      admin_activity_logs: {
        Row: {
          action: string;
          created_at: string;
          id: string;
          metadata: Json;
          path: string | null;
          user_id: string | null;
        };
        Insert: {
          action: string;
          created_at?: string;
          id?: string;
          metadata?: Json;
          path?: string | null;
          user_id?: string | null;
        };
        Update: {
          action?: string;
          created_at?: string;
          id?: string;
          metadata?: Json;
          path?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      admin_api_keys: {
        Row: {
          created_at: string;
          id: string;
          key_hash: string;
          key_prefix: string;
          last_used_at: string | null;
          name: string;
          revoked_at: string | null;
          scopes: string[];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          key_hash: string;
          key_prefix: string;
          last_used_at?: string | null;
          name: string;
          revoked_at?: string | null;
          scopes?: string[];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          key_hash?: string;
          key_prefix?: string;
          last_used_at?: string | null;
          name?: string;
          revoked_at?: string | null;
          scopes?: string[];
          user_id?: string;
        };
        Relationships: [];
      };
      admin_audit_logs: {
        Row: {
          action: string;
          after: Json | null;
          before: Json | null;
          created_at: string;
          entity_id: string | null;
          entity_type: string;
          id: string;
          ip: unknown;
          user_agent: string | null;
          user_id: string | null;
        };
        Insert: {
          action: string;
          after?: Json | null;
          before?: Json | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type: string;
          id?: string;
          ip?: unknown;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Update: {
          action?: string;
          after?: Json | null;
          before?: Json | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string;
          id?: string;
          ip?: unknown;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      admin_login_history: {
        Row: {
          created_at: string;
          id: string;
          ip: unknown;
          success: boolean;
          user_agent: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          ip?: unknown;
          success?: boolean;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          ip?: unknown;
          success?: boolean;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      announcements: {
        Row: {
          created_at: string;
          dismissible: boolean;
          ends_at: string | null;
          href: string | null;
          id: string;
          is_active: boolean;
          message: string;
          starts_at: string | null;
          variant: string;
        };
        Insert: {
          created_at?: string;
          dismissible?: boolean;
          ends_at?: string | null;
          href?: string | null;
          id?: string;
          is_active?: boolean;
          message: string;
          starts_at?: string | null;
          variant?: string;
        };
        Update: {
          created_at?: string;
          dismissible?: boolean;
          ends_at?: string | null;
          href?: string | null;
          id?: string;
          is_active?: boolean;
          message?: string;
          starts_at?: string | null;
          variant?: string;
        };
        Relationships: [];
      };
      badges: {
        Row: {
          code: string;
          coin_reward: number;
          color: string | null;
          created_at: string;
          description: string | null;
          icon_url: string | null;
          id: string;
          is_active: boolean;
          name: string;
          rarity: string;
          xp_reward: number;
        };
        Insert: {
          code: string;
          coin_reward?: number;
          color?: string | null;
          created_at?: string;
          description?: string | null;
          icon_url?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          rarity?: string;
          xp_reward?: number;
        };
        Update: {
          code?: string;
          coin_reward?: number;
          color?: string | null;
          created_at?: string;
          description?: string | null;
          icon_url?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          rarity?: string;
          xp_reward?: number;
        };
        Relationships: [];
      };
      blog_authors: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          id: string;
          name: string;
          user_id: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          id?: string;
          name: string;
          user_id?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          id?: string;
          name?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      blog_categories: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          slug: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          slug: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      blog_posts: {
        Row: {
          author_id: string | null;
          body_markdown: string;
          category_id: string | null;
          cover_image: string | null;
          created_at: string;
          excerpt: string | null;
          id: string;
          og_image: string | null;
          published_at: string | null;
          seo_description: string | null;
          seo_title: string | null;
          slug: string;
          status: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          author_id?: string | null;
          body_markdown?: string;
          category_id?: string | null;
          cover_image?: string | null;
          created_at?: string;
          excerpt?: string | null;
          id?: string;
          og_image?: string | null;
          published_at?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug: string;
          status?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          author_id?: string | null;
          body_markdown?: string;
          category_id?: string | null;
          cover_image?: string | null;
          created_at?: string;
          excerpt?: string | null;
          id?: string;
          og_image?: string | null;
          published_at?: string | null;
          seo_description?: string | null;
          seo_title?: string | null;
          slug?: string;
          status?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "blog_authors";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "blog_posts_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "blog_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      certificate_templates: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          is_active: boolean;
          is_default: boolean;
          name: string;
          preview_url: string | null;
          template: Json;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          is_default?: boolean;
          name: string;
          preview_url?: string | null;
          template?: Json;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          is_default?: boolean;
          name?: string;
          preview_url?: string | null;
          template?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      certificates: {
        Row: {
          accuracy: number;
          cpm: number;
          display_name: string;
          id: string;
          issued_at: string;
          language: string;
          mode: string;
          mode_value: number;
          user_id: string;
          wpm: number;
        };
        Insert: {
          accuracy: number;
          cpm: number;
          display_name: string;
          id: string;
          issued_at?: string;
          language?: string;
          mode: string;
          mode_value: number;
          user_id: string;
          wpm: number;
        };
        Update: {
          accuracy?: number;
          cpm?: number;
          display_name?: string;
          id?: string;
          issued_at?: string;
          language?: string;
          mode?: string;
          mode_value?: number;
          user_id?: string;
          wpm?: number;
        };
        Relationships: [];
      };
      coupons: {
        Row: {
          amount_off_cents: number | null;
          code: string;
          created_at: string;
          currency: string | null;
          description: string | null;
          expires_at: string | null;
          id: string;
          is_active: boolean;
          max_redemptions: number | null;
          percent_off: number | null;
          redeemed_count: number;
        };
        Insert: {
          amount_off_cents?: number | null;
          code: string;
          created_at?: string;
          currency?: string | null;
          description?: string | null;
          expires_at?: string | null;
          id?: string;
          is_active?: boolean;
          max_redemptions?: number | null;
          percent_off?: number | null;
          redeemed_count?: number;
        };
        Update: {
          amount_off_cents?: number | null;
          code?: string;
          created_at?: string;
          currency?: string | null;
          description?: string | null;
          expires_at?: string | null;
          id?: string;
          is_active?: boolean;
          max_redemptions?: number | null;
          percent_off?: number | null;
          redeemed_count?: number;
        };
        Relationships: [];
      };
      custom_test_attempts: {
        Row: {
          accuracy: number | null;
          browser: string | null;
          completed: boolean | null;
          completed_at: string | null;
          consistency: number | null;
          country: string | null;
          created_at: string;
          device: string | null;
          duration_actual: number | null;
          email: string | null;
          flag_reasons: string[] | null;
          flagged: boolean | null;
          id: string;
          ip_hash: string | null;
          mistakes: number | null;
          raw_wpm: number | null;
          started_at: string | null;
          test_id: string;
          user_id: string | null;
          wpm: number | null;
        };
        Insert: {
          accuracy?: number | null;
          browser?: string | null;
          completed?: boolean | null;
          completed_at?: string | null;
          consistency?: number | null;
          country?: string | null;
          created_at?: string;
          device?: string | null;
          duration_actual?: number | null;
          email?: string | null;
          flag_reasons?: string[] | null;
          flagged?: boolean | null;
          id?: string;
          ip_hash?: string | null;
          mistakes?: number | null;
          raw_wpm?: number | null;
          started_at?: string | null;
          test_id: string;
          user_id?: string | null;
          wpm?: number | null;
        };
        Update: {
          accuracy?: number | null;
          browser?: string | null;
          completed?: boolean | null;
          completed_at?: string | null;
          consistency?: number | null;
          country?: string | null;
          created_at?: string;
          device?: string | null;
          duration_actual?: number | null;
          email?: string | null;
          flag_reasons?: string[] | null;
          flagged?: boolean | null;
          id?: string;
          ip_hash?: string | null;
          mistakes?: number | null;
          raw_wpm?: number | null;
          started_at?: string | null;
          test_id?: string;
          user_id?: string | null;
          wpm?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "custom_test_attempts_test_id_fkey";
            columns: ["test_id"];
            isOneToOne: false;
            referencedRelation: "custom_tests";
            referencedColumns: ["id"];
          },
        ];
      };
      custom_tests: {
        Row: {
          access_type: string | null;
          allow_capitals: boolean | null;
          allow_linebreaks: boolean | null;
          allow_numbers: boolean | null;
          allow_punctuation: boolean | null;
          allow_quotes: boolean | null;
          allow_symbols: boolean | null;
          anticheat_flags: Json | null;
          attempts_count: number | null;
          attempts_limit: number | null;
          auto_close: boolean | null;
          backspace_limit: number | null;
          backspace_mode: string | null;
          banner_url: string | null;
          category: string | null;
          cert_min_accuracy: number | null;
          cert_min_wpm: number | null;
          certificate_enabled: boolean | null;
          certificate_template_id: string | null;
          content: string;
          content_source: string | null;
          cover_image_url: string | null;
          created_at: string;
          creator_id: string;
          currency: string | null;
          description: string | null;
          difficulty: string | null;
          duration_seconds: number;
          email_whitelist: string[] | null;
          expires_at: string | null;
          featured: boolean | null;
          id: string;
          language: string | null;
          leaderboard_enabled: boolean | null;
          leaderboard_size: number | null;
          leaderboard_visibility: string | null;
          monetization_enabled: boolean | null;
          name: string;
          org_id: string | null;
          password_hash: string | null;
          pinned: boolean | null;
          price_cents: number | null;
          published_at: string | null;
          result_visible_stats: Json | null;
          slug: string;
          spell_check: boolean | null;
          start_at: string | null;
          status: string | null;
          tags: string[] | null;
          timezone: string | null;
          updated_at: string;
          views_count: number | null;
        };
        Insert: {
          access_type?: string | null;
          allow_capitals?: boolean | null;
          allow_linebreaks?: boolean | null;
          allow_numbers?: boolean | null;
          allow_punctuation?: boolean | null;
          allow_quotes?: boolean | null;
          allow_symbols?: boolean | null;
          anticheat_flags?: Json | null;
          attempts_count?: number | null;
          attempts_limit?: number | null;
          auto_close?: boolean | null;
          backspace_limit?: number | null;
          backspace_mode?: string | null;
          banner_url?: string | null;
          category?: string | null;
          cert_min_accuracy?: number | null;
          cert_min_wpm?: number | null;
          certificate_enabled?: boolean | null;
          certificate_template_id?: string | null;
          content?: string;
          content_source?: string | null;
          cover_image_url?: string | null;
          created_at?: string;
          creator_id: string;
          currency?: string | null;
          description?: string | null;
          difficulty?: string | null;
          duration_seconds?: number;
          email_whitelist?: string[] | null;
          expires_at?: string | null;
          featured?: boolean | null;
          id?: string;
          language?: string | null;
          leaderboard_enabled?: boolean | null;
          leaderboard_size?: number | null;
          leaderboard_visibility?: string | null;
          monetization_enabled?: boolean | null;
          name: string;
          org_id?: string | null;
          password_hash?: string | null;
          pinned?: boolean | null;
          price_cents?: number | null;
          published_at?: string | null;
          result_visible_stats?: Json | null;
          slug: string;
          spell_check?: boolean | null;
          start_at?: string | null;
          status?: string | null;
          tags?: string[] | null;
          timezone?: string | null;
          updated_at?: string;
          views_count?: number | null;
        };
        Update: {
          access_type?: string | null;
          allow_capitals?: boolean | null;
          allow_linebreaks?: boolean | null;
          allow_numbers?: boolean | null;
          allow_punctuation?: boolean | null;
          allow_quotes?: boolean | null;
          allow_symbols?: boolean | null;
          anticheat_flags?: Json | null;
          attempts_count?: number | null;
          attempts_limit?: number | null;
          auto_close?: boolean | null;
          backspace_limit?: number | null;
          backspace_mode?: string | null;
          banner_url?: string | null;
          category?: string | null;
          cert_min_accuracy?: number | null;
          cert_min_wpm?: number | null;
          certificate_enabled?: boolean | null;
          certificate_template_id?: string | null;
          content?: string;
          content_source?: string | null;
          cover_image_url?: string | null;
          created_at?: string;
          creator_id?: string;
          currency?: string | null;
          description?: string | null;
          difficulty?: string | null;
          duration_seconds?: number;
          email_whitelist?: string[] | null;
          expires_at?: string | null;
          featured?: boolean | null;
          id?: string;
          language?: string | null;
          leaderboard_enabled?: boolean | null;
          leaderboard_size?: number | null;
          leaderboard_visibility?: string | null;
          monetization_enabled?: boolean | null;
          name?: string;
          org_id?: string | null;
          password_hash?: string | null;
          pinned?: boolean | null;
          price_cents?: number | null;
          published_at?: string | null;
          result_visible_stats?: Json | null;
          slug?: string;
          spell_check?: boolean | null;
          start_at?: string | null;
          status?: string | null;
          tags?: string[] | null;
          timezone?: string | null;
          updated_at?: string;
          views_count?: number | null;
        };
        Relationships: [];
      };
      follows: {
        Row: {
          created_at: string;
          follower_id: string;
          following_id: string;
        };
        Insert: {
          created_at?: string;
          follower_id: string;
          following_id: string;
        };
        Update: {
          created_at?: string;
          follower_id?: string;
          following_id?: string;
        };
        Relationships: [];
      };
      footer_links: {
        Row: {
          created_at: string;
          href: string;
          icon: string | null;
          id: string;
          is_active: boolean;
          label: string;
          open_in_new_tab: boolean;
          rel: string | null;
          section_id: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          href: string;
          icon?: string | null;
          id?: string;
          is_active?: boolean;
          label: string;
          open_in_new_tab?: boolean;
          rel?: string | null;
          section_id: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          href?: string;
          icon?: string | null;
          id?: string;
          is_active?: boolean;
          label?: string;
          open_in_new_tab?: boolean;
          rel?: string | null;
          section_id?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "footer_links_section_id_fkey";
            columns: ["section_id"];
            isOneToOne: false;
            referencedRelation: "footer_sections";
            referencedColumns: ["id"];
          },
        ];
      };
      footer_sections: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          key: string;
          sort_order: number;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          key: string;
          sort_order?: number;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          key?: string;
          sort_order?: number;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      game_configs: {
        Row: {
          audio_url: string | null;
          banner_url: string | null;
          coin_reward: number;
          created_at: string;
          description: string | null;
          difficulty: string;
          icon_url: string | null;
          id: string;
          is_active: boolean;
          is_featured: boolean;
          levels: Json;
          rules: Json;
          scoring: Json;
          slug: string;
          sort_order: number;
          timer_seconds: number | null;
          title: string;
          updated_at: string;
          xp_reward: number;
        };
        Insert: {
          audio_url?: string | null;
          banner_url?: string | null;
          coin_reward?: number;
          created_at?: string;
          description?: string | null;
          difficulty?: string;
          icon_url?: string | null;
          id?: string;
          is_active?: boolean;
          is_featured?: boolean;
          levels?: Json;
          rules?: Json;
          scoring?: Json;
          slug: string;
          sort_order?: number;
          timer_seconds?: number | null;
          title: string;
          updated_at?: string;
          xp_reward?: number;
        };
        Update: {
          audio_url?: string | null;
          banner_url?: string | null;
          coin_reward?: number;
          created_at?: string;
          description?: string | null;
          difficulty?: string;
          icon_url?: string | null;
          id?: string;
          is_active?: boolean;
          is_featured?: boolean;
          levels?: Json;
          rules?: Json;
          scoring?: Json;
          slug?: string;
          sort_order?: number;
          timer_seconds?: number | null;
          title?: string;
          updated_at?: string;
          xp_reward?: number;
        };
        Relationships: [];
      };
      game_scores: {
        Row: {
          accuracy: number;
          combo_max: number;
          created_at: string;
          difficulty: string;
          duration_seconds: number;
          game_slug: string;
          id: string;
          level_reached: number;
          metadata: Json;
          score: number;
          user_id: string;
          words_typed: number;
          wpm: number;
        };
        Insert: {
          accuracy?: number;
          combo_max?: number;
          created_at?: string;
          difficulty?: string;
          duration_seconds?: number;
          game_slug: string;
          id?: string;
          level_reached?: number;
          metadata?: Json;
          score?: number;
          user_id: string;
          words_typed?: number;
          wpm?: number;
        };
        Update: {
          accuracy?: number;
          combo_max?: number;
          created_at?: string;
          difficulty?: string;
          duration_seconds?: number;
          game_slug?: string;
          id?: string;
          level_reached?: number;
          metadata?: Json;
          score?: number;
          user_id?: string;
          words_typed?: number;
          wpm?: number;
        };
        Relationships: [];
      };
      languages: {
        Row: {
          code: string;
          created_at: string;
          enabled: boolean;
          flag: string | null;
          label: string;
          native: string;
          rtl: boolean;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          enabled?: boolean;
          flag?: string | null;
          label: string;
          native: string;
          rtl?: boolean;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          enabled?: boolean;
          flag?: string | null;
          label?: string;
          native?: string;
          rtl?: boolean;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      legal_page_versions: {
        Row: {
          content: string;
          created_at: string;
          created_by: string | null;
          id: string;
          page_id: string;
          snapshot: Json | null;
          title: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          page_id: string;
          snapshot?: Json | null;
          title: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          page_id?: string;
          snapshot?: Json | null;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "legal_page_versions_page_id_fkey";
            columns: ["page_id"];
            isOneToOne: false;
            referencedRelation: "legal_pages";
            referencedColumns: ["id"];
          },
        ];
      };
      legal_pages: {
        Row: {
          attachments: Json | null;
          breadcrumbs: Json | null;
          canonical_url: string | null;
          content: string;
          created_at: string;
          format: string;
          id: string;
          meta_description: string | null;
          meta_title: string | null;
          og_image: string | null;
          publish_at: string | null;
          robots: string | null;
          schema_jsonld: Json | null;
          show_in_footer: boolean;
          show_in_nav: boolean;
          slug: string;
          sort_order: number;
          status: string;
          title: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          attachments?: Json | null;
          breadcrumbs?: Json | null;
          canonical_url?: string | null;
          content?: string;
          created_at?: string;
          format?: string;
          id?: string;
          meta_description?: string | null;
          meta_title?: string | null;
          og_image?: string | null;
          publish_at?: string | null;
          robots?: string | null;
          schema_jsonld?: Json | null;
          show_in_footer?: boolean;
          show_in_nav?: boolean;
          slug: string;
          sort_order?: number;
          status?: string;
          title: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          attachments?: Json | null;
          breadcrumbs?: Json | null;
          canonical_url?: string | null;
          content?: string;
          created_at?: string;
          format?: string;
          id?: string;
          meta_description?: string | null;
          meta_title?: string | null;
          og_image?: string | null;
          publish_at?: string | null;
          robots?: string | null;
          schema_jsonld?: Json | null;
          show_in_footer?: boolean;
          show_in_nav?: boolean;
          slug?: string;
          sort_order?: number;
          status?: string;
          title?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      media_assets: {
        Row: {
          alt: string | null;
          bucket: string;
          created_at: string;
          filename: string;
          folder: string | null;
          height: number | null;
          id: string;
          mime_type: string | null;
          path: string;
          size_bytes: number | null;
          tags: string[];
          uploader_id: string | null;
          url: string;
          width: number | null;
        };
        Insert: {
          alt?: string | null;
          bucket?: string;
          created_at?: string;
          filename: string;
          folder?: string | null;
          height?: number | null;
          id?: string;
          mime_type?: string | null;
          path: string;
          size_bytes?: number | null;
          tags?: string[];
          uploader_id?: string | null;
          url: string;
          width?: number | null;
        };
        Update: {
          alt?: string | null;
          bucket?: string;
          created_at?: string;
          filename?: string;
          folder?: string | null;
          height?: number | null;
          id?: string;
          mime_type?: string | null;
          path?: string;
          size_bytes?: number | null;
          tags?: string[];
          uploader_id?: string | null;
          url?: string;
          width?: number | null;
        };
        Relationships: [];
      };
      missions: {
        Row: {
          active: boolean;
          code: string;
          coin_reward: number;
          created_at: string;
          description: string;
          id: string;
          metric: string;
          scope: string;
          threshold: number;
          title: string;
          xp_reward: number;
        };
        Insert: {
          active?: boolean;
          code: string;
          coin_reward?: number;
          created_at?: string;
          description: string;
          id?: string;
          metric: string;
          scope: string;
          threshold: number;
          title: string;
          xp_reward?: number;
        };
        Update: {
          active?: boolean;
          code?: string;
          coin_reward?: number;
          created_at?: string;
          description?: string;
          id?: string;
          metric?: string;
          scope?: string;
          threshold?: number;
          title?: string;
          xp_reward?: number;
        };
        Relationships: [];
      };
      newsletter_subscribers: {
        Row: {
          confirmed: boolean;
          created_at: string;
          email: string;
          id: string;
          source: string | null;
        };
        Insert: {
          confirmed?: boolean;
          created_at?: string;
          email: string;
          id?: string;
          source?: string | null;
        };
        Update: {
          confirmed?: boolean;
          created_at?: string;
          email?: string;
          id?: string;
          source?: string | null;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          body: string | null;
          created_at: string;
          id: string;
          link: string | null;
          read: boolean;
          title: string;
          type: string;
          user_id: string;
        };
        Insert: {
          body?: string | null;
          created_at?: string;
          id?: string;
          link?: string | null;
          read?: boolean;
          title: string;
          type: string;
          user_id: string;
        };
        Update: {
          body?: string | null;
          created_at?: string;
          id?: string;
          link?: string | null;
          read?: boolean;
          title?: string;
          type?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      page_views: {
        Row: {
          browser: string | null;
          country: string | null;
          created_at: string;
          device: string | null;
          id: string;
          os: string | null;
          path: string;
          referrer: string | null;
          session_id: string | null;
          user_id: string | null;
        };
        Insert: {
          browser?: string | null;
          country?: string | null;
          created_at?: string;
          device?: string | null;
          id?: string;
          os?: string | null;
          path: string;
          referrer?: string | null;
          session_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          browser?: string | null;
          country?: string | null;
          created_at?: string;
          device?: string | null;
          id?: string;
          os?: string | null;
          path?: string;
          referrer?: string | null;
          session_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      passage_library: {
        Row: {
          content: string;
          created_at: string;
          creator_id: string | null;
          difficulty: string | null;
          id: string;
          is_public: boolean | null;
          language: string | null;
          tags: string[] | null;
          title: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          creator_id?: string | null;
          difficulty?: string | null;
          id?: string;
          is_public?: boolean | null;
          language?: string | null;
          tags?: string[] | null;
          title: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          creator_id?: string | null;
          difficulty?: string | null;
          id?: string;
          is_public?: boolean | null;
          language?: string | null;
          tags?: string[] | null;
          title?: string;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          amount_cents: number;
          created_at: string;
          currency: string;
          description: string | null;
          id: string;
          invoice_url: string | null;
          provider: string | null;
          provider_payment_id: string | null;
          status: string;
          user_id: string;
        };
        Insert: {
          amount_cents: number;
          created_at?: string;
          currency?: string;
          description?: string | null;
          id?: string;
          invoice_url?: string | null;
          provider?: string | null;
          provider_payment_id?: string | null;
          status?: string;
          user_id: string;
        };
        Update: {
          amount_cents?: number;
          created_at?: string;
          currency?: string;
          description?: string | null;
          id?: string;
          invoice_url?: string | null;
          provider?: string | null;
          provider_payment_id?: string | null;
          status?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          admin_notes: string | null;
          avatar_url: string | null;
          ban_reason: string | null;
          banned_at: string | null;
          best_wpm: number;
          bio: string | null;
          city: string | null;
          coins: number;
          country: string | null;
          created_at: string;
          current_streak: number;
          display_name: string | null;
          id: string;
          is_public: boolean;
          last_active_date: string | null;
          level: number;
          longest_streak: number;
          preferred_language: string | null;
          state: string | null;
          suspended_until: string | null;
          tests_completed: number;
          updated_at: string;
          username: string | null;
          xp: number;
        };
        Insert: {
          admin_notes?: string | null;
          avatar_url?: string | null;
          ban_reason?: string | null;
          banned_at?: string | null;
          best_wpm?: number;
          bio?: string | null;
          city?: string | null;
          coins?: number;
          country?: string | null;
          created_at?: string;
          current_streak?: number;
          display_name?: string | null;
          id: string;
          is_public?: boolean;
          last_active_date?: string | null;
          level?: number;
          longest_streak?: number;
          preferred_language?: string | null;
          state?: string | null;
          suspended_until?: string | null;
          tests_completed?: number;
          updated_at?: string;
          username?: string | null;
          xp?: number;
        };
        Update: {
          admin_notes?: string | null;
          avatar_url?: string | null;
          ban_reason?: string | null;
          banned_at?: string | null;
          best_wpm?: number;
          bio?: string | null;
          city?: string | null;
          coins?: number;
          country?: string | null;
          created_at?: string;
          current_streak?: number;
          display_name?: string | null;
          id?: string;
          is_public?: boolean;
          last_active_date?: string | null;
          level?: number;
          longest_streak?: number;
          preferred_language?: string | null;
          state?: string | null;
          suspended_until?: string | null;
          tests_completed?: number;
          updated_at?: string;
          username?: string | null;
          xp?: number;
        };
        Relationships: [];
      };
      redirects: {
        Row: {
          created_at: string;
          destination: string;
          id: string;
          is_active: boolean;
          source: string;
          status_code: number;
        };
        Insert: {
          created_at?: string;
          destination: string;
          id?: string;
          is_active?: boolean;
          source: string;
          status_code?: number;
        };
        Update: {
          created_at?: string;
          destination?: string;
          id?: string;
          is_active?: boolean;
          source?: string;
          status_code?: number;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          created_at: string;
          id: string;
          reason: string;
          reporter_id: string | null;
          status: string;
          target_id: string;
          target_type: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          reason: string;
          reporter_id?: string | null;
          status?: string;
          target_id: string;
          target_type: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          reason?: string;
          reporter_id?: string | null;
          status?: string;
          target_id?: string;
          target_type?: string;
        };
        Relationships: [];
      };
      role_permissions: {
        Row: {
          created_at: string;
          id: string;
          permission: string;
          role: Database["public"]["Enums"]["app_role"];
        };
        Insert: {
          created_at?: string;
          id?: string;
          permission: string;
          role: Database["public"]["Enums"]["app_role"];
        };
        Update: {
          created_at?: string;
          id?: string;
          permission?: string;
          role?: Database["public"]["Enums"]["app_role"];
        };
        Relationships: [];
      };
      room_members: {
        Row: {
          accuracy: number;
          avatar_url: string | null;
          display_name: string | null;
          finish_rank: number | null;
          finished_at: string | null;
          is_spectator: boolean;
          joined_at: string;
          progress: number;
          room_id: string;
          user_id: string;
          wpm: number;
        };
        Insert: {
          accuracy?: number;
          avatar_url?: string | null;
          display_name?: string | null;
          finish_rank?: number | null;
          finished_at?: string | null;
          is_spectator?: boolean;
          joined_at?: string;
          progress?: number;
          room_id: string;
          user_id: string;
          wpm?: number;
        };
        Update: {
          accuracy?: number;
          avatar_url?: string | null;
          display_name?: string | null;
          finish_rank?: number | null;
          finished_at?: string | null;
          is_spectator?: boolean;
          joined_at?: string;
          progress?: number;
          room_id?: string;
          user_id?: string;
          wpm?: number;
        };
        Relationships: [
          {
            foreignKeyName: "room_members_room_id_fkey";
            columns: ["room_id"];
            isOneToOne: false;
            referencedRelation: "rooms";
            referencedColumns: ["id"];
          },
        ];
      };
      rooms: {
        Row: {
          code: string;
          created_at: string;
          finished_at: string | null;
          host_id: string;
          id: string;
          language: string;
          max_players: number;
          name: string;
          ranked: boolean;
          started_at: string | null;
          starts_at: string | null;
          status: string;
          text: string;
          visibility: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          finished_at?: string | null;
          host_id: string;
          id?: string;
          language?: string;
          max_players?: number;
          name?: string;
          ranked?: boolean;
          started_at?: string | null;
          starts_at?: string | null;
          status?: string;
          text: string;
          visibility?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          finished_at?: string | null;
          host_id?: string;
          id?: string;
          language?: string;
          max_players?: number;
          name?: string;
          ranked?: boolean;
          started_at?: string | null;
          starts_at?: string | null;
          status?: string;
          text?: string;
          visibility?: string;
        };
        Relationships: [];
      };
      scheduled_publishes: {
        Row: {
          created_at: string;
          created_by: string | null;
          entity_id: string;
          entity_type: string;
          id: string;
          publish_at: string;
          status: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          entity_id: string;
          entity_type: string;
          id?: string;
          publish_at: string;
          status?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          entity_id?: string;
          entity_type?: string;
          id?: string;
          publish_at?: string;
          status?: string;
        };
        Relationships: [];
      };
      seo_overrides: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          is_active: boolean;
          noindex: boolean;
          og_description: string | null;
          og_image: string | null;
          og_title: string | null;
          path: string;
          schema_json: Json | null;
          title: string | null;
          twitter_card: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          noindex?: boolean;
          og_description?: string | null;
          og_image?: string | null;
          og_title?: string | null;
          path: string;
          schema_json?: Json | null;
          title?: string | null;
          twitter_card?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          noindex?: boolean;
          og_description?: string | null;
          og_image?: string | null;
          og_title?: string | null;
          path?: string;
          schema_json?: Json | null;
          title?: string | null;
          twitter_card?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          is_public: boolean;
          key: string;
          updated_at: string;
          updated_by: string | null;
          value: Json;
        };
        Insert: {
          is_public?: boolean;
          key: string;
          updated_at?: string;
          updated_by?: string | null;
          value?: Json;
        };
        Update: {
          is_public?: boolean;
          key?: string;
          updated_at?: string;
          updated_by?: string | null;
          value?: Json;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          created_at: string;
          current_period_end: string | null;
          id: string;
          plan: string;
          provider: string | null;
          provider_subscription_id: string | null;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          current_period_end?: string | null;
          id?: string;
          plan?: string;
          provider?: string | null;
          provider_subscription_id?: string | null;
          status?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          current_period_end?: string | null;
          id?: string;
          plan?: string;
          provider?: string | null;
          provider_subscription_id?: string | null;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      template_categories: {
        Row: {
          created_at: string;
          description: string | null;
          icon: string | null;
          id: string;
          is_active: boolean;
          name: string;
          parent_id: string | null;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          icon?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          parent_id?: string | null;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          icon?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          parent_id?: string | null;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "template_categories_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "template_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      template_favorites: {
        Row: {
          created_at: string;
          template_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          template_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          template_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "template_favorites_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "templates";
            referencedColumns: ["id"];
          },
        ];
      };
      template_purchases: {
        Row: {
          amount_cents: number;
          coupon_code: string | null;
          created_at: string;
          currency: string;
          id: string;
          provider: string | null;
          provider_ref: string | null;
          status: string;
          template_id: string;
          user_id: string;
        };
        Insert: {
          amount_cents?: number;
          coupon_code?: string | null;
          created_at?: string;
          currency?: string;
          id?: string;
          provider?: string | null;
          provider_ref?: string | null;
          status?: string;
          template_id: string;
          user_id: string;
        };
        Update: {
          amount_cents?: number;
          coupon_code?: string | null;
          created_at?: string;
          currency?: string;
          id?: string;
          provider?: string | null;
          provider_ref?: string | null;
          status?: string;
          template_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "template_purchases_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "templates";
            referencedColumns: ["id"];
          },
        ];
      };
      template_reports: {
        Row: {
          created_at: string;
          details: string | null;
          id: string;
          reason: string;
          status: string;
          template_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          details?: string | null;
          id?: string;
          reason: string;
          status?: string;
          template_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          details?: string | null;
          id?: string;
          reason?: string;
          status?: string;
          template_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "template_reports_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "templates";
            referencedColumns: ["id"];
          },
        ];
      };
      template_reviews: {
        Row: {
          body: string;
          created_at: string;
          id: string;
          parent_id: string | null;
          rating: number;
          status: string;
          template_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          body?: string;
          created_at?: string;
          id?: string;
          parent_id?: string | null;
          rating?: number;
          status?: string;
          template_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          id?: string;
          parent_id?: string | null;
          rating?: number;
          status?: string;
          template_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "template_reviews_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "template_reviews";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "template_reviews_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "templates";
            referencedColumns: ["id"];
          },
        ];
      };
      template_revisions: {
        Row: {
          created_at: string;
          created_by: string | null;
          id: string;
          note: string | null;
          snapshot: Json;
          template_id: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          note?: string | null;
          snapshot: Json;
          template_id: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          note?: string | null;
          snapshot?: Json;
          template_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "template_revisions_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "templates";
            referencedColumns: ["id"];
          },
        ];
      };
      template_tag_map: {
        Row: {
          tag_id: string;
          template_id: string;
        };
        Insert: {
          tag_id: string;
          template_id: string;
        };
        Update: {
          tag_id?: string;
          template_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "template_tag_map_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "template_tags";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "template_tag_map_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "templates";
            referencedColumns: ["id"];
          },
        ];
      };
      template_tags: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          slug: string;
          usage_count: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          slug: string;
          usage_count?: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          slug?: string;
          usage_count?: number;
        };
        Relationships: [];
      };
      template_usages: {
        Row: {
          action: string;
          created_at: string;
          id: string;
          template_id: string;
          user_id: string;
        };
        Insert: {
          action?: string;
          created_at?: string;
          id?: string;
          template_id: string;
          user_id: string;
        };
        Update: {
          action?: string;
          created_at?: string;
          id?: string;
          template_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "template_usages_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "templates";
            referencedColumns: ["id"];
          },
        ];
      };
      templates: {
        Row: {
          ai_prompt: string | null;
          attempt_limit: number | null;
          banner_url: string | null;
          category_id: string | null;
          certificate_enabled: boolean;
          certificate_template_id: string | null;
          content_mode: string;
          content_source: string;
          content_text: string;
          copies_count: number;
          coupon_code: string | null;
          created_at: string;
          creator_id: string;
          currency: string;
          description: string;
          difficulty: string;
          discount_percent: number;
          duration_seconds: number;
          favorites_count: number;
          id: string;
          is_featured: boolean;
          is_pinned: boolean;
          is_premium: boolean;
          language: string;
          leaderboard_enabled: boolean;
          leaderboard_scope: string;
          name: string;
          og_image_url: string | null;
          password_hash: string | null;
          price_cents: number;
          published_at: string | null;
          rating_avg: number;
          rating_count: number;
          reward_badge_id: string | null;
          reward_coins: number;
          reward_xp: number;
          schema_jsonld: Json | null;
          scoring_rules: Json;
          seo_description: string | null;
          seo_title: string | null;
          slug: string;
          status: string;
          thumbnail_url: string | null;
          updated_at: string;
          uses_count: number;
          views_count: number;
          visibility: string;
          word_count: number;
        };
        Insert: {
          ai_prompt?: string | null;
          attempt_limit?: number | null;
          banner_url?: string | null;
          category_id?: string | null;
          certificate_enabled?: boolean;
          certificate_template_id?: string | null;
          content_mode?: string;
          content_source?: string;
          content_text?: string;
          copies_count?: number;
          coupon_code?: string | null;
          created_at?: string;
          creator_id: string;
          currency?: string;
          description?: string;
          difficulty?: string;
          discount_percent?: number;
          duration_seconds?: number;
          favorites_count?: number;
          id?: string;
          is_featured?: boolean;
          is_pinned?: boolean;
          is_premium?: boolean;
          language?: string;
          leaderboard_enabled?: boolean;
          leaderboard_scope?: string;
          name: string;
          og_image_url?: string | null;
          password_hash?: string | null;
          price_cents?: number;
          published_at?: string | null;
          rating_avg?: number;
          rating_count?: number;
          reward_badge_id?: string | null;
          reward_coins?: number;
          reward_xp?: number;
          schema_jsonld?: Json | null;
          scoring_rules?: Json;
          seo_description?: string | null;
          seo_title?: string | null;
          slug: string;
          status?: string;
          thumbnail_url?: string | null;
          updated_at?: string;
          uses_count?: number;
          views_count?: number;
          visibility?: string;
          word_count?: number;
        };
        Update: {
          ai_prompt?: string | null;
          attempt_limit?: number | null;
          banner_url?: string | null;
          category_id?: string | null;
          certificate_enabled?: boolean;
          certificate_template_id?: string | null;
          content_mode?: string;
          content_source?: string;
          content_text?: string;
          copies_count?: number;
          coupon_code?: string | null;
          created_at?: string;
          creator_id?: string;
          currency?: string;
          description?: string;
          difficulty?: string;
          discount_percent?: number;
          duration_seconds?: number;
          favorites_count?: number;
          id?: string;
          is_featured?: boolean;
          is_pinned?: boolean;
          is_premium?: boolean;
          language?: string;
          leaderboard_enabled?: boolean;
          leaderboard_scope?: string;
          name?: string;
          og_image_url?: string | null;
          password_hash?: string | null;
          price_cents?: number;
          published_at?: string | null;
          rating_avg?: number;
          rating_count?: number;
          reward_badge_id?: string | null;
          reward_coins?: number;
          reward_xp?: number;
          schema_jsonld?: Json | null;
          scoring_rules?: Json;
          seo_description?: string | null;
          seo_title?: string | null;
          slug?: string;
          status?: string;
          thumbnail_url?: string | null;
          updated_at?: string;
          uses_count?: number;
          views_count?: number;
          visibility?: string;
          word_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: "templates_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "template_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      test_durations: {
        Row: {
          banner_url: string | null;
          category: string;
          created_at: string;
          description_md: string;
          difficulty: string;
          enabled: boolean;
          faq: Json;
          featured: boolean;
          h1: string;
          id: string;
          is_new: boolean;
          kind: string;
          meta_description: string;
          nav_label: string;
          popular: boolean;
          seconds: number | null;
          slug: string;
          sort_order: number;
          title: string;
          updated_at: string;
        };
        Insert: {
          banner_url?: string | null;
          category?: string;
          created_at?: string;
          description_md?: string;
          difficulty?: string;
          enabled?: boolean;
          faq?: Json;
          featured?: boolean;
          h1: string;
          id?: string;
          is_new?: boolean;
          kind?: string;
          meta_description: string;
          nav_label: string;
          popular?: boolean;
          seconds?: number | null;
          slug: string;
          sort_order?: number;
          title: string;
          updated_at?: string;
        };
        Update: {
          banner_url?: string | null;
          category?: string;
          created_at?: string;
          description_md?: string;
          difficulty?: string;
          enabled?: boolean;
          faq?: Json;
          featured?: boolean;
          h1?: string;
          id?: string;
          is_new?: boolean;
          kind?: string;
          meta_description?: string;
          nav_label?: string;
          popular?: boolean;
          seconds?: number | null;
          slug?: string;
          sort_order?: number;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tournament_entries: {
        Row: {
          best_accuracy: number;
          best_wpm: number;
          joined_at: string;
          score: number;
          tournament_id: string;
          user_id: string;
        };
        Insert: {
          best_accuracy?: number;
          best_wpm?: number;
          joined_at?: string;
          score?: number;
          tournament_id: string;
          user_id: string;
        };
        Update: {
          best_accuracy?: number;
          best_wpm?: number;
          joined_at?: string;
          score?: number;
          tournament_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tournament_entries_tournament_id_fkey";
            columns: ["tournament_id"];
            isOneToOne: false;
            referencedRelation: "tournaments";
            referencedColumns: ["id"];
          },
        ];
      };
      tournaments: {
        Row: {
          created_at: string;
          description: string | null;
          ends_at: string | null;
          id: string;
          name: string;
          prize_coins: number;
          prize_xp: number;
          starts_at: string;
          status: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          ends_at?: string | null;
          id?: string;
          name: string;
          prize_coins?: number;
          prize_xp?: number;
          starts_at: string;
          status?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          ends_at?: string | null;
          id?: string;
          name?: string;
          prize_coins?: number;
          prize_xp?: number;
          starts_at?: string;
          status?: string;
        };
        Relationships: [];
      };
      translation_history: {
        Row: {
          changed_at: string;
          changed_by: string | null;
          id: string;
          key: string;
          lang: string;
          namespace: string;
          new_value: string | null;
          old_value: string | null;
        };
        Insert: {
          changed_at?: string;
          changed_by?: string | null;
          id?: string;
          key: string;
          lang: string;
          namespace: string;
          new_value?: string | null;
          old_value?: string | null;
        };
        Update: {
          changed_at?: string;
          changed_by?: string | null;
          id?: string;
          key?: string;
          lang?: string;
          namespace?: string;
          new_value?: string | null;
          old_value?: string | null;
        };
        Relationships: [];
      };
      translations: {
        Row: {
          created_at: string;
          id: string;
          key: string;
          lang: string;
          namespace: string;
          updated_at: string;
          updated_by: string | null;
          value: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          key: string;
          lang: string;
          namespace: string;
          updated_at?: string;
          updated_by?: string | null;
          value: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          key?: string;
          lang?: string;
          namespace?: string;
          updated_at?: string;
          updated_by?: string | null;
          value?: string;
        };
        Relationships: [
          {
            foreignKeyName: "translations_lang_fkey";
            columns: ["lang"];
            isOneToOne: false;
            referencedRelation: "languages";
            referencedColumns: ["code"];
          },
        ];
      };
      typing_results: {
        Row: {
          accuracy: number;
          chars_correct: number;
          chars_extra: number;
          chars_incorrect: number;
          chars_missed: number;
          consistency: number | null;
          cpm: number;
          created_at: string;
          duration_seconds: number;
          id: string;
          language: string;
          mode: string;
          mode_value: number;
          raw_wpm: number;
          user_id: string;
          wpm: number;
        };
        Insert: {
          accuracy: number;
          chars_correct?: number;
          chars_extra?: number;
          chars_incorrect?: number;
          chars_missed?: number;
          consistency?: number | null;
          cpm: number;
          created_at?: string;
          duration_seconds: number;
          id?: string;
          language?: string;
          mode: string;
          mode_value: number;
          raw_wpm: number;
          user_id: string;
          wpm: number;
        };
        Update: {
          accuracy?: number;
          chars_correct?: number;
          chars_extra?: number;
          chars_incorrect?: number;
          chars_missed?: number;
          consistency?: number | null;
          cpm?: number;
          created_at?: string;
          duration_seconds?: number;
          id?: string;
          language?: string;
          mode?: string;
          mode_value?: number;
          raw_wpm?: number;
          user_id?: string;
          wpm?: number;
        };
        Relationships: [];
      };
      typing_text_versions: {
        Row: {
          created_at: string;
          edited_by: string | null;
          id: string;
          snapshot: Json;
          text_id: string;
        };
        Insert: {
          created_at?: string;
          edited_by?: string | null;
          id?: string;
          snapshot: Json;
          text_id: string;
        };
        Update: {
          created_at?: string;
          edited_by?: string | null;
          id?: string;
          snapshot?: Json;
          text_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "typing_text_versions_text_id_fkey";
            columns: ["text_id"];
            isOneToOne: false;
            referencedRelation: "typing_texts";
            referencedColumns: ["id"];
          },
        ];
      };
      typing_texts: {
        Row: {
          category: string;
          collection: string | null;
          content: string;
          created_at: string;
          created_by: string | null;
          difficulty: string;
          featured: boolean;
          id: string;
          is_active: boolean;
          language: string;
          publish_at: string | null;
          sort_order: number;
          status: string;
          tags: string[];
          title: string;
          updated_at: string;
        };
        Insert: {
          category?: string;
          collection?: string | null;
          content: string;
          created_at?: string;
          created_by?: string | null;
          difficulty?: string;
          featured?: boolean;
          id?: string;
          is_active?: boolean;
          language?: string;
          publish_at?: string | null;
          sort_order?: number;
          status?: string;
          tags?: string[];
          title: string;
          updated_at?: string;
        };
        Update: {
          category?: string;
          collection?: string | null;
          content?: string;
          created_at?: string;
          created_by?: string | null;
          difficulty?: string;
          featured?: boolean;
          id?: string;
          is_active?: boolean;
          language?: string;
          publish_at?: string | null;
          sort_order?: number;
          status?: string;
          tags?: string[];
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_achievements: {
        Row: {
          code: string;
          id: string;
          unlocked_at: string;
          user_id: string;
        };
        Insert: {
          code: string;
          id?: string;
          unlocked_at?: string;
          user_id: string;
        };
        Update: {
          code?: string;
          id?: string;
          unlocked_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_achievements_code_fkey";
            columns: ["code"];
            isOneToOne: false;
            referencedRelation: "achievements";
            referencedColumns: ["code"];
          },
        ];
      };
      user_missions: {
        Row: {
          claimed: boolean;
          claimed_at: string | null;
          completed: boolean;
          completed_at: string | null;
          mission_id: string;
          period_key: string;
          progress: number;
          user_id: string;
        };
        Insert: {
          claimed?: boolean;
          claimed_at?: string | null;
          completed?: boolean;
          completed_at?: string | null;
          mission_id: string;
          period_key: string;
          progress?: number;
          user_id: string;
        };
        Update: {
          claimed?: boolean;
          claimed_at?: string | null;
          completed?: boolean;
          completed_at?: string | null;
          mission_id?: string;
          period_key?: string;
          progress?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_missions_mission_id_fkey";
            columns: ["mission_id"];
            isOneToOne: false;
            referencedRelation: "missions";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_permission: {
        Args: { _permission: string; _user_id: string };
        Returns: boolean;
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      increment_custom_test_attempts: {
        Args: { _test_id: string };
        Returns: undefined;
      };
      increment_custom_test_views: {
        Args: { _test_id: string };
        Returns: undefined;
      };
      is_admin: { Args: { _user_id: string }; Returns: boolean };
      submit_game_score: {
        Args: {
          _accuracy: number;
          _combo_max?: number;
          _difficulty?: string;
          _duration_seconds: number;
          _game_slug: string;
          _level_reached?: number;
          _metadata?: Json;
          _score: number;
          _words_typed?: number;
          _wpm: number;
        };
        Returns: Json;
      };
      tpl_increment_views: { Args: { _slug: string }; Returns: undefined };
      tpl_rating_recalc: { Args: { _tpl: string }; Returns: undefined };
    };
    Enums: {
      app_role:
        | "admin"
        | "editor"
        | "user"
        | "moderator"
        | "support"
        | "premium"
        | "teacher"
        | "hr"
        | "org_admin";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "editor",
        "user",
        "moderator",
        "support",
        "premium",
        "teacher",
        "hr",
        "org_admin",
      ],
    },
  },
} as const;
