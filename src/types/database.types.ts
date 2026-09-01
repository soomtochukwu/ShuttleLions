export type Json =
 | string
 | number
 | boolean
 | null
 | { [key: string]: Json | undefined }
 | Json[]

export type Database = {
 // Allows to automatically instantiate createClient with right options
 // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
 __InternalSupabase: {
 PostgrestVersion: "14.5"
 }
 graphql_public: {
 Tables: {
 [_ in never]: never
 }
 Views: {
 [_ in never]: never
 }
 Functions: {
 graphql: {
 Args: {
 extensions?: Json
 operationName?: string
 query?: string
 variables?: Json
 }
 Returns: Json
 }
 }
 Enums: {
 [_ in never]: never
 }
 CompositeTypes: {
 [_ in never]: never
 }
 }
 public: {
 Tables: {
 chat_channels: {
 Row: {
 created_at: string
 created_by: string | null
 description: string
 icon: string
 id: string
 is_default: boolean
 name: string
 }
 Insert: {
 created_at?: string
 created_by?: string | null
 description?: string
 icon?: string
 id?: string
 is_default?: boolean
 name: string
 }
 Update: {
 created_at?: string
 created_by?: string | null
 description?: string
 icon?: string
 id?: string
 is_default?: boolean
 name?: string
 }
 Relationships: [
 {
 foreignKeyName: "chat_channels_created_by_fkey"
 columns: ["created_by"]
 isOneToOne: false
 referencedRelation: "profiles"
 referencedColumns: ["id"]
 },
 ]
 }
 chat_messages: {
 Row: {
 channel_id: string
 content: string
 created_at: string
 id: string
 is_pinned: boolean
 media_url: string | null
 message_type: string
 sender_id: string
 updated_at: string
 }
 Insert: {
 channel_id: string
 content: string
 created_at?: string
 id?: string
 is_pinned?: boolean
 media_url?: string | null
 message_type?: string
 sender_id: string
 updated_at?: string
 }
 Update: {
 channel_id?: string
 content?: string
 created_at?: string
 id?: string
 is_pinned?: boolean
 media_url?: string | null
 message_type?: string
 sender_id?: string
 updated_at?: string
 }
 Relationships: [
 {
 foreignKeyName: "chat_messages_channel_id_fkey"
 columns: ["channel_id"]
 isOneToOne: false
 referencedRelation: "chat_channels"
 referencedColumns: ["id"]
 },
 {
 foreignKeyName: "chat_messages_sender_id_fkey"
 columns: ["sender_id"]
 isOneToOne: false
 referencedRelation: "profiles"
 referencedColumns: ["id"]
 },
 ]
 }
 event_rsvps: {
 Row: {
 created_at: string
 event_id: string
 id: string
 profile_id: string
 status: string
 updated_at: string
 }
 Insert: {
 created_at?: string
 event_id: string
 id?: string
 profile_id: string
 status?: string
 updated_at?: string
 }
 Update: {
 created_at?: string
 event_id?: string
 id?: string
 profile_id?: string
 status?: string
 updated_at?: string
 }
 Relationships: [
 {
 foreignKeyName: "event_rsvps_event_id_fkey"
 columns: ["event_id"]
 isOneToOne: false
 referencedRelation: "events"
 referencedColumns: ["id"]
 },
 {
 foreignKeyName: "event_rsvps_profile_id_fkey"
 columns: ["profile_id"]
 isOneToOne: false
 referencedRelation: "profiles"
 referencedColumns: ["id"]
 },
 ]
 }
 events: {
 Row: {
 created_at: string
 created_by: string | null
 description: string
 end_at: string
 event_type: string
 id: string
 is_recurring: boolean
 location: string
 recurrence_rule: string | null
 start_at: string
 status: string
 title: string
 updated_at: string
 }
 Insert: {
 created_at?: string
 created_by?: string | null
 description?: string
 end_at: string
 event_type?: string
 id?: string
 is_recurring?: boolean
 location?: string
 recurrence_rule?: string | null
 start_at: string
 status?: string
 title: string
 updated_at?: string
 }
 Update: {
 created_at?: string
 created_by?: string | null
 description?: string
 end_at?: string
 event_type?: string
 id?: string
 is_recurring?: boolean
 location?: string
 recurrence_rule?: string | null
 start_at?: string
 status?: string
 title?: string
 updated_at?: string
 }
 Relationships: [
 {
 foreignKeyName: "events_created_by_fkey"
 columns: ["created_by"]
 isOneToOne: false
 referencedRelation: "profiles"
 referencedColumns: ["id"]
 },
 ]
 }
 media_comments: {
 Row: {
 commenter_id: string
 content: string
 created_at: string
 id: string
 media_id: string
 }
 Insert: {
 commenter_id: string
 content: string
 created_at?: string
 id?: string
 media_id: string
 }
 Update: {
 commenter_id?: string
 content?: string
 created_at?: string
 id?: string
 media_id?: string
 }
 Relationships: [
 {
 foreignKeyName: "media_comments_commenter_id_fkey"
 columns: ["commenter_id"]
 isOneToOne: false
 referencedRelation: "profiles"
 referencedColumns: ["id"]
 },
 {
 foreignKeyName: "media_comments_media_id_fkey"
 columns: ["media_id"]
 isOneToOne: false
 referencedRelation: "media_uploads"
 referencedColumns: ["id"]
 },
 ]
 }
 media_likes: {
 Row: {
 created_at: string
 id: string
 media_id: string
 profile_id: string
 }
 Insert: {
 created_at?: string
 id?: string
 media_id: string
 profile_id: string
 }
 Update: {
 created_at?: string
 id?: string
 media_id?: string
 profile_id?: string
 }
 Relationships: [
 {
 foreignKeyName: "media_likes_media_id_fkey"
 columns: ["media_id"]
 isOneToOne: false
 referencedRelation: "media_uploads"
 referencedColumns: ["id"]
 },
 {
 foreignKeyName: "media_likes_profile_id_fkey"
 columns: ["profile_id"]
 isOneToOne: false
 referencedRelation: "profiles"
 referencedColumns: ["id"]
 },
 ]
 }
 media_uploads: {
 Row: {
 category: string
 created_at: string
 description: string
 id: string
 likes_count: number
 media_type: string
 media_url: string
 thumbnail_url: string | null
 title: string
 updated_at: string
 uploader_id: string
 views_count: number
 }
 Insert: {
 category?: string
 created_at?: string
 description?: string
 id?: string
 likes_count?: number
 media_type?: string
 media_url: string
 thumbnail_url?: string | null
 title: string
 updated_at?: string
 uploader_id: string
 views_count?: number
 }
 Update: {
 category?: string
 created_at?: string
 description?: string
 id?: string
 likes_count?: number
 media_type?: string
 media_url?: string
 thumbnail_url?: string | null
 title?: string
 updated_at?: string
 uploader_id?: string
 views_count?: number
 }
 Relationships: [
 {
 foreignKeyName: "media_uploads_uploader_id_fkey"
 columns: ["uploader_id"]
 isOneToOne: false
 referencedRelation: "profiles"
 referencedColumns: ["id"]
 },
 ]
 }
 notifications: {
 Row: {
 body: string
 created_at: string
 id: string
 is_read: boolean
 link_url: string | null
 profile_id: string
 title: string
 type: string
 }
 Insert: {
 body: string
 created_at?: string
 id?: string
 is_read?: boolean
 link_url?: string | null
 profile_id: string
 title: string
 type?: string
 }
 Update: {
 body?: string
 created_at?: string
 id?: string
 is_read?: boolean
 link_url?: string | null
 profile_id?: string
 title?: string
 type?: string
 }
 Relationships: [
 {
 foreignKeyName: "notifications_profile_id_fkey"
 columns: ["profile_id"]
 isOneToOne: false
 referencedRelation: "profiles"
 referencedColumns: ["id"]
 },
 ]
 }
 payments: {
 Row: {
 amount_kobo: number
 created_at: string
 id: string
 metadata: Json | null
 profile_id: string
 provider: string
 reference: string
 status: string
 type: string
 updated_at: string
 }
 Insert: {
 amount_kobo: number
 created_at?: string
 id?: string
 metadata?: Json | null
 profile_id: string
 provider?: string
 reference: string
 status?: string
 type: string
 updated_at?: string
 }
 Update: {
 amount_kobo?: number
 created_at?: string
 id?: string
 metadata?: Json | null
 profile_id?: string
 provider?: string
 reference?: string
 status?: string
 type?: string
 updated_at?: string
 }
 Relationships: [
 {
 foreignKeyName: "payments_profile_id_fkey"
 columns: ["profile_id"]
 isOneToOne: false
 referencedRelation: "profiles"
 referencedColumns: ["id"]
 },
 ]
 }
 poll_options: {
 Row: {
 display_order: number
 id: string
 option_text: string
 poll_id: string
 vote_count: number
 }
 Insert: {
 display_order?: number
 id?: string
 option_text: string
 poll_id: string
 vote_count?: number
 }
 Update: {
 display_order?: number
 id?: string
 option_text?: string
 poll_id?: string
 vote_count?: number
 }
 Relationships: [
 {
 foreignKeyName: "poll_options_poll_id_fkey"
 columns: ["poll_id"]
 isOneToOne: false
 referencedRelation: "polls"
 referencedColumns: ["id"]
 },
 ]
 }
 poll_votes: {
 Row: {
 created_at: string
 id: string
 option_id: string
 poll_id: string
 voter_id: string
 }
 Insert: {
 created_at?: string
 id?: string
 option_id: string
 poll_id: string
 voter_id: string
 }
 Update: {
 created_at?: string
 id?: string
 option_id?: string
 poll_id?: string
 voter_id?: string
 }
 Relationships: [
 {
 foreignKeyName: "poll_votes_option_id_fkey"
 columns: ["option_id"]
 isOneToOne: false
 referencedRelation: "poll_options"
 referencedColumns: ["id"]
 },
 {
 foreignKeyName: "poll_votes_poll_id_fkey"
 columns: ["poll_id"]
 isOneToOne: false
 referencedRelation: "polls"
 referencedColumns: ["id"]
 },
 {
 foreignKeyName: "poll_votes_voter_id_fkey"
 columns: ["voter_id"]
 isOneToOne: false
 referencedRelation: "profiles"
 referencedColumns: ["id"]
 },
 ]
 }
 polls: {
 Row: {
 closes_at: string | null
 created_at: string
 created_by: string
 description: string
 id: string
 poll_type: string
 status: string
 title: string
 updated_at: string
 }
 Insert: {
 closes_at?: string | null
 created_at?: string
 created_by: string
 description?: string
 id?: string
 poll_type?: string
 status?: string
 title: string
 updated_at?: string
 }
 Update: {
 closes_at?: string | null
 created_at?: string
 created_by?: string
 description?: string
 id?: string
 poll_type?: string
 status?: string
 title?: string
 updated_at?: string
 }
 Relationships: [
 {
 foreignKeyName: "polls_created_by_fkey"
 columns: ["created_by"]
 isOneToOne: false
 referencedRelation: "profiles"
 referencedColumns: ["id"]
 },
 ]
 }
 profiles: {
 Row: {
 auth_user_id: string
 avatar_url: string | null
 created_at: string
 department: string
 email: string
 faculty: string
 full_name: string
 id: string
 is_active: boolean
 level: string
 phone: string | null
 reg_number: string | null
 role: string
 updated_at: string
 }
 Insert: {
 auth_user_id: string
 avatar_url?: string | null
 created_at?: string
 department?: string
 email: string
 faculty?: string
 full_name?: string
 id?: string
 is_active?: boolean
 level?: string
 phone?: string | null
 reg_number?: string | null
 role?: string
 updated_at?: string
 }
 Update: {
 auth_user_id?: string
 avatar_url?: string | null
 created_at?: string
 department?: string
 email?: string
 faculty?: string
 full_name?: string
 id?: string
 is_active?: boolean
 level?: string
 phone?: string | null
 reg_number?: string | null
 role?: string
 updated_at?: string
 }
 Relationships: []
 }
 racket_orders: {
 Row: {
 created_at: string
 id: string
 notes: string | null
 payment_id: string | null
 profile_id: string
 quantity: number
 racket_model: string
 status: string
 total_price_kobo: number
 unit_price_kobo: number
 updated_at: string
 }
 Insert: {
 created_at?: string
 id?: string
 notes?: string | null
 payment_id?: string | null
 profile_id: string
 quantity?: number
 racket_model: string
 status?: string
 total_price_kobo: number
 unit_price_kobo: number
 updated_at?: string
 }
 Update: {
 created_at?: string
 id?: string
 notes?: string | null
 payment_id?: string | null
 profile_id?: string
 quantity?: number
 racket_model?: string
 status?: string
 total_price_kobo?: number
 unit_price_kobo?: number
 updated_at?: string
 }
 Relationships: [
 {
 foreignKeyName: "racket_orders_payment_id_fkey"
 columns: ["payment_id"]
 isOneToOne: false
 referencedRelation: "payments"
 referencedColumns: ["id"]
 },
 {
 foreignKeyName: "racket_orders_profile_id_fkey"
 columns: ["profile_id"]
 isOneToOne: false
 referencedRelation: "profiles"
 referencedColumns: ["id"]
 },
 ]
 }
 shop_orders: {
 Row: {
 assigned_executive_id: string | null
 created_at: string
 id: string
 notes: string | null
 payment_id: string | null
 product_id: string
 profile_id: string
 quantity: number
 status: string
 total_price_kobo: number
 updated_at: string
 }
 Insert: {
 assigned_executive_id?: string | null
 created_at?: string
 id?: string
 notes?: string | null
 payment_id?: string | null
 product_id: string
 profile_id: string
 quantity?: number
 status?: string
 total_price_kobo: number
 updated_at?: string
 }
 Update: {
 assigned_executive_id?: string | null
 created_at?: string
 id?: string
 notes?: string | null
 payment_id?: string | null
 product_id?: string
 profile_id?: string
 quantity?: number
 status?: string
 total_price_kobo?: number
 updated_at?: string
 }
 Relationships: [
 {
 foreignKeyName: "shop_orders_assigned_executive_id_fkey"
 columns: ["assigned_executive_id"]
 isOneToOne: false
 referencedRelation: "profiles"
 referencedColumns: ["id"]
 },
 {
 foreignKeyName: "shop_orders_payment_id_fkey"
 columns: ["payment_id"]
 isOneToOne: false
 referencedRelation: "payments"
 referencedColumns: ["id"]
 },
 {
 foreignKeyName: "shop_orders_product_id_fkey"
 columns: ["product_id"]
 isOneToOne: false
 referencedRelation: "shop_products"
 referencedColumns: ["id"]
 },
 {
 foreignKeyName: "shop_orders_profile_id_fkey"
 columns: ["profile_id"]
 isOneToOne: false
 referencedRelation: "profiles"
 referencedColumns: ["id"]
 },
 ]
 }
 shop_products: {
 Row: {
 brand: string
 category: string
 created_at: string
 description: string
 id: string
 image_url: string | null
 name: string
 price_kobo: number
 specs: Json | null
 stock_status: string
 updated_at: string
 }
 Insert: {
 brand?: string
 category?: string
 created_at?: string
 description?: string
 id?: string
 image_url?: string | null
 name: string
 price_kobo: number
 specs?: Json | null
 stock_status?: string
 updated_at?: string
 }
 Update: {
 brand?: string
 category?: string
 created_at?: string
 description?: string
 id?: string
 image_url?: string | null
 name?: string
 price_kobo?: number
 specs?: Json | null
 stock_status?: string
 updated_at?: string
 }
 Relationships: []
 }
 site_assets: {
 Row: {
 alt_text: string
 asset_url: string
 depth_multiplier: number
 id: string
 name: string
 scale_max: number
 scale_min: number
 updated_at: string
 updated_by: string | null
 }
 Insert: {
 alt_text?: string
 asset_url: string
 depth_multiplier?: number
 id: string
 name: string
 scale_max?: number
 scale_min?: number
 updated_at?: string
 updated_by?: string | null
 }
 Update: {
 alt_text?: string
 asset_url?: string
 depth_multiplier?: number
 id?: string
 name?: string
 scale_max?: number
 scale_min?: number
 updated_at?: string
 updated_by?: string | null
 }
 Relationships: [
 {
 foreignKeyName: "site_assets_updated_by_fkey"
 columns: ["updated_by"]
 isOneToOne: false
 referencedRelation: "profiles"
 referencedColumns: ["id"]
 },
 ]
 }
 tutorials: {
 Row: {
 author_id: string | null
 category: string
 content_md: string
 created_at: string
 difficulty: string
 id: string
 is_published: boolean
 read_time_min: number
 summary: string
 thumbnail_url: string | null
 title: string
 updated_at: string
 video_url: string | null
 }
 Insert: {
 author_id?: string | null
 category?: string
 content_md: string
 created_at?: string
 difficulty?: string
 id?: string
 is_published?: boolean
 read_time_min?: number
 summary?: string
 thumbnail_url?: string | null
 title: string
 updated_at?: string
 video_url?: string | null
 }
 Update: {
 author_id?: string | null
 category?: string
 content_md?: string
 created_at?: string
 difficulty?: string
 id?: string
 is_published?: boolean
 read_time_min?: number
 summary?: string
 thumbnail_url?: string | null
 title?: string
 updated_at?: string
 video_url?: string | null
 }
 Relationships: [
 {
 foreignKeyName: "tutorials_author_id_fkey"
 columns: ["author_id"]
 isOneToOne: false
 referencedRelation: "profiles"
 referencedColumns: ["id"]
 },
 ]
 }
 }
 Views: {
 [_ in never]: never
 }
 Functions: {
 [_ in never]: never
 }
 Enums: {
 [_ in never]: never
 }
 CompositeTypes: {
 [_ in never]: never
 }
 }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
 DefaultSchemaTableNameOrOptions extends
 | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
 | { schema: keyof DatabaseWithoutInternals },
 TableName extends DefaultSchemaTableNameOrOptions extends {
 schema: keyof DatabaseWithoutInternals
 }
 ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
 DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
 : never = never,
> = DefaultSchemaTableNameOrOptions extends {
 schema: keyof DatabaseWithoutInternals
}
 ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
 DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
 Row: infer R
 }
 ? R
 : never
 : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
 DefaultSchema["Views"])
 ? (DefaultSchema["Tables"] &
 DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
 Row: infer R
 }
 ? R
 : never
 : never

export type TablesInsert<
 DefaultSchemaTableNameOrOptions extends
 | keyof DefaultSchema["Tables"]
 | { schema: keyof DatabaseWithoutInternals },
 TableName extends DefaultSchemaTableNameOrOptions extends {
 schema: keyof DatabaseWithoutInternals
 }
 ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
 : never = never,
> = DefaultSchemaTableNameOrOptions extends {
 schema: keyof DatabaseWithoutInternals
}
 ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
 Insert: infer I
 }
 ? I
 : never
 : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
 ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
 Insert: infer I
 }
 ? I
 : never
 : never

export type TablesUpdate<
 DefaultSchemaTableNameOrOptions extends
 | keyof DefaultSchema["Tables"]
 | { schema: keyof DatabaseWithoutInternals },
 TableName extends DefaultSchemaTableNameOrOptions extends {
 schema: keyof DatabaseWithoutInternals
 }
 ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
 : never = never,
> = DefaultSchemaTableNameOrOptions extends {
 schema: keyof DatabaseWithoutInternals
}
 ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
 Update: infer U
 }
 ? U
 : never
 : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
 ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
 Update: infer U
 }
 ? U
 : never
 : never

export type Enums<
 DefaultSchemaEnumNameOrOptions extends
 | keyof DefaultSchema["Enums"]
 | { schema: keyof DatabaseWithoutInternals },
 EnumName extends DefaultSchemaEnumNameOrOptions extends {
 schema: keyof DatabaseWithoutInternals
 }
 ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
 : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
 schema: keyof DatabaseWithoutInternals
}
 ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
 : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
 ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
 : never

export type CompositeTypes<
 PublicCompositeTypeNameOrOptions extends
 | keyof DefaultSchema["CompositeTypes"]
 | { schema: keyof DatabaseWithoutInternals },
 CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
 schema: keyof DatabaseWithoutInternals
 }
 ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
 : never = never,
> = PublicCompositeTypeNameOrOptions extends {
 schema: keyof DatabaseWithoutInternals
}
 ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
 : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
 ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
 : never

export const Constants = {
 graphql_public: {
 Enums: {},
 },
 public: {
 Enums: {},
 },
} as const
