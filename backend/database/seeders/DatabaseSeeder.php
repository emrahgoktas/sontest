<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Test;
use App\Models\Question;
use App\Models\OnlineExam;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@akilli.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'plan_type' => 'premium',
            'is_active' => true,
        ]);

        // Create sample teacher
        $teacher = User::create([
            'name' => 'Ahmet Öğretmen',
            'email' => 'ahmet@example.com',
            'password' => Hash::make('password'),
            'role' => 'teacher',
            'plan_type' => 'pro',
            'school_name' => 'Atatürk İlkokulu',
            'subject' => 'Matematik',
            'grade_level' => '5. Sınıf',
            'is_active' => true,
        ]);

        // Create sample student
        $student = User::create([
            'id' => 99999, // Fixed demo student ID
            'name' => 'Ayşe Öğrenci',
            'email' => 'ayse@example.com',
            'password' => Hash::make('password'),
            'role' => 'student',
            'plan_type' => 'free',
            'school_name' => 'Atatürk İlkokulu',
            'grade_level' => '5. Sınıf',
            'is_active' => true,
        ]);

        // Create sample test
        $test = Test::create([
            'user_id' => $teacher->id,
            'title' => 'Matematik 1. Dönem Sınavı',
            'description' => 'Toplama ve çıkarma işlemleri',
            'lesson' => 'Matematik',
            'class_name' => '5-A',
            'teacher_name' => $teacher->name,
            'question_spacing' => 5,
            'theme' => 'classic',
            'include_answer_key' => true,
            'is_public' => true,
            'tags' => ['matematik', '5.sınıf', 'dönem sınavı'],
        ]);

        // Create sample questions
        for ($i = 1; $i <= 10; $i++) {
            Question::create([
                'test_id' => $test->id,
                'question_text' => "Bu {$i}. matematik sorusudur. 5 + 3 = ?",
                'options' => [
                    'A' => '6',
                    'B' => '7',
                    'C' => '8',
                    'D' => '9',
                    'E' => '10',
                ],
                'correct_answer' => 'C',
                'points' => 1,
                'explanation' => '5 + 3 = 8 olduğu için doğru cevap C şıkkıdır.',
                'order_index' => $i - 1,
                'question_type' => 'manual',
                'difficulty' => ['easy', 'medium', 'hard'][rand(0, 2)],
                'subject' => 'Matematik',
                'tags' => ['toplama', 'temel matematik'],
            ]);
        }

        // Create sample online exam
        $onlineExam = OnlineExam::create([
            'test_id' => $test->id,
            'user_id' => $teacher->id,
            'title' => 'Matematik Online Sınavı',
            'description' => 'Toplama ve çıkarma konularından online sınav',
            'time_limit' => 60,
            'shuffle_questions' => false,
            'shuffle_options' => false,
            'show_results' => true,
            'allow_review' => true,
            'is_active' => true,
            'start_date' => now(),
            'end_date' => now()->addDays(7),
        ]);

        $this->command->info('Database seeded successfully!');
        $this->command->info('Admin: admin@akilli.com / admin123');
        $this->command->info('Teacher: ahmet@example.com / password');
        $this->command->info('Student: ayse@example.com / password');
    }
}