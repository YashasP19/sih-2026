from django.core.management.base import BaseCommand
from seed_data import seed_database


class Command(BaseCommand):
    help = 'Seeds initial test users, departments, and realistic civic grievances.'

    def handle(self, *args, **options):
        seed_database()
        self.stdout.write(self.style.SUCCESS('Successfully seeded Urban Lens platform data!'))
