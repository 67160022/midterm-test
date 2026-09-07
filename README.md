**รัน เข้่่าMySQL คำสั่ง**

1. docker compose exec mysql mysql -u root -proot ใช้คำสั่งนี้ในการเข้า sql

2. SHOW DATABASES; ควรเห็น examDB

3. docker compose exec redis redis-cli ping เพื่อเช็คว่า redis ทำงาน ถ้าทำงาน จะขึ้น **PONG**

4. เช็คว่า POST เข้า db

- docker compose exec mysql mysql -u root -proot exam_db

5. เข้า db ของ exam

- docker compose exec mysql mysql -u root -proot exam_db

ถ้าเจอ docker not found

ให้
ls /Applications/Docker.app/Contents/Resources/bin/

echo 'export PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"' >> ~/.zshrc

source ~/.zshrc
