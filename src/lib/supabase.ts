import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gciwhtxjwqwblnhwlgtb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjaXdodHhqd3F3YmxuaHdsZ3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMjY1MjIsImV4cCI6MjA3NTYwMjUyMn0.d8EI8ArxmYiiZQKsvXVT9g-VzZcyyAYXciSoDPiIbN4';

export const supabase = createClient(supabaseUrl, supabaseKey);
