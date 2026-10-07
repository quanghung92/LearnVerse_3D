const SUPABASE_URL = 'https://gxnxmgmfuwdfhdfhzkxf.supabase.co';
const ANON_KEY = 'sb_publishable_OtTkzstwhSpFUDvO5mkA3A_FcD256Rt';

async function testApi() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*`, {
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`
    }
  });
  console.log('PROFILES HTTP STATUS:', res.status);
  const data = await res.json();
  console.log('PROFILES DATA:', data);

  const resCourses = await fetch(`${SUPABASE_URL}/rest/v1/courses?select=*`, {
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`
    }
  });
  console.log('COURSES HTTP STATUS:', resCourses.status);
  const coursesData = await resCourses.json();
  console.log('COURSES DATA:', coursesData);
}

testApi();
