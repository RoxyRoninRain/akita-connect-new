-- Enable replication for the notifications table to allow Supabase Realtime to work
alter publication supabase_realtime add table notifications;
