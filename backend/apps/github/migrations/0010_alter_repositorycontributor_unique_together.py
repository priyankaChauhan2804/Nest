# Generated by Django 5.1.1 on 2024-09-22 22:52

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("github", "0009_remove_repositorycontributor_node_id"),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name="repositorycontributor",
            unique_together={("repository", "user")},
        ),
    ]
