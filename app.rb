require 'sinatra'
require 'sinatra/json'
require 'sinatra/activerecord'

set :database, {adapter: "sqlite3", database: "tetris_scores.sqlite3"}

set :public_folder, 'public'

class Score < ActiveRecord::Base
end

if !ActiveRecord::Base.connection.table_exists?(:scores)
  ActiveRecord::Base.connection.create_table :scores do |t|
    t.string :name
    t.integer :score
    t.integer :lines
    t.timestamps
  end
end

get '/' do
  send_file File.join(settings.public_folder, 'index.html')
end

get '/api/scores' do
  top_scores = Score.order(score: :desc).limit(10)
  json top_scores
end

post '/api/scores' do

  data = JSON.parse(request.body.read)
  
  new_score = Score.create(
    name: data['name'],
    score: data['score'],
    lines: data['lines']
  )
  
  if new_score.persisted?
    status 201
    json new_score
  else
    status 500
    json({ error: "No se pudo guardar la puntuación" })
  end
end