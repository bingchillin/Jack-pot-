const { Pool } = require('pg');

// Configuration de la base de données (adaptez selon votre configuration)
const pool = new Pool({
  user: 'debian',
  host: 'localhost',
  database: 'jack_pot_db',
  password: 'debian123',
  port: 5432,
});

async function checkCommentTable() {
  try {
    // Vérifier si la table comment existe
    const tableQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'comment';
    `;
    
    const tableResult = await pool.query(tableQuery);
    console.log('Table comment exists:', tableResult.rows.length > 0);
    
    if (tableResult.rows.length > 0) {
      // Vérifier les colonnes de la table comment
      const columnsQuery = `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'comment'
        ORDER BY ordinal_position;
      `;
      
      const columnsResult = await pool.query(columnsQuery);
      console.log('\nColumns in comment table:');
      console.table(columnsResult.rows);
      
      // Vérifier spécifiquement la colonne image_url
      const imageUrlColumn = columnsResult.rows.find(col => col.column_name === 'image_url');
      console.log('\nimage_url column:', imageUrlColumn ? 'EXISTS' : 'MISSING');
      
      // Tester une requête simple
      const testQuery = 'SELECT id_comment, content, image_url, tag FROM comment LIMIT 5';
      const testResult = await pool.query(testQuery);
      console.log('\nSample comments:');
      console.table(testResult.rows);
    }
    
  } catch (error) {
    console.error('Error checking comment table:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

checkCommentTable(); 