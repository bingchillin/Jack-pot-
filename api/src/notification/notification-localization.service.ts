import { Injectable } from '@nestjs/common';

export interface NotificationContent {
  title: string;
  body: string;
  advice?: string;
}

export interface LocalizedNotificationData {
  urgentCount: number;
  totalCount: number;
  issues: string[];
  plantName?: string;
}

@Injectable()
export class NotificationLocalizationService {
  private readonly translations = {
    en: {
      urgent: 'Urgent!',
      needsCare: 'Needs care',
      multipleIssues: '{count} issues',
      needsWaterUrgently: 'Needs water urgently!',
      timeToWater: 'Time to water',
      lightIssue: 'Light issue detected',
      temperatureProblem: 'Temperature problem',
      lowNutrients: 'Low soil nutrients',
      waterLevelIssue: 'Water level issue',
      sensorAlert: 'Sensor alert',
      issuesDetected: '{count} issues detected',
      urgentIssues: '{count} urgent issues!',
      issuesWithUrgent: '{total} issues ({urgent} urgent)',
      adviceCheckMoisture: 'Check soil moisture and water if needed',
      adviceAdjustLight: 'Adjust plant position for optimal light exposure',
      adviceTemperature: 'Move plant to a more suitable temperature environment',
      adviceNutrients: 'Consider adding fertilizer to improve soil nutrients',
      adviceWaterLevel: 'Check water reservoir and drainage system',
      adviceGeneral: 'Please check your plant\'s overall health and environment.',
    },
    fr: {
      urgent: 'Urgent !',
      needsCare: 'Nécessite des soins',
      multipleIssues: '{count} problèmes',
      needsWaterUrgently: 'Nécessite de l\'eau d\'urgence !',
      timeToWater: 'Il est temps d\'arroser',
      lightIssue: 'Problème de lumière détecté',
      temperatureProblem: 'Problème de température',
      lowNutrients: 'Faibles nutriments du sol',
      waterLevelIssue: 'Problème de niveau d\'eau',
      sensorAlert: 'Alerte capteur',
      issuesDetected: '{count} problèmes détectés',
      urgentIssues: '{count} problèmes urgents !',
      issuesWithUrgent: '{total} problèmes ({urgent} urgents)',
      adviceCheckMoisture: 'Vérifiez l\'humidité du sol et arrosez si nécessaire',
      adviceAdjustLight: 'Ajustez la position de la plante pour une exposition optimale à la lumière',
      adviceTemperature: 'Déplacez la plante vers un environnement à température plus appropriée',
      adviceNutrients: 'Envisagez d\'ajouter de l\'engrais pour améliorer les nutriments du sol',
      adviceWaterLevel: 'Vérifiez le réservoir d\'eau et le système de drainage',
      adviceGeneral: 'Veuillez vérifier la santé générale de votre plante et son environnement.',
    },
    es: {
      urgent: '¡Urgente!',
      needsCare: 'Necesita cuidado',
      multipleIssues: '{count} problemas',
      needsWaterUrgently: '¡Necesita agua urgentemente!',
      timeToWater: 'Hora de regar',
      lightIssue: 'Problema de luz detectado',
      temperatureProblem: 'Problema de temperatura',
      lowNutrients: 'Bajos nutrientes del suelo',
      waterLevelIssue: 'Problema de nivel de agua',
      sensorAlert: 'Alerta de sensor',
      issuesDetected: '{count} problemas detectados',
      urgentIssues: '¡{count} problemas urgentes!',
      issuesWithUrgent: '{total} problemas ({urgent} urgentes)',
      adviceCheckMoisture: 'Verifica la humedad del suelo y riega si es necesario',
      adviceAdjustLight: 'Ajusta la posición de la planta para una exposición óptima a la luz',
      adviceTemperature: 'Mueve la planta a un entorno con temperatura más adecuada',
      adviceNutrients: 'Considera agregar fertilizante para mejorar los nutrientes del suelo',
      adviceWaterLevel: 'Verifica el depósito de agua y el sistema de drenaje',
      adviceGeneral: 'Por favor verifica la salud general de tu planta y su entorno.',
    },
  };

  /**
   * Get localized notification content for consolidated alerts
   */
  getLocalizedNotification(
    locale: string = 'en',
    data: LocalizedNotificationData,
  ): NotificationContent {
    const lang = this.translations[locale] || this.translations.en;
    const { urgentCount, totalCount, issues, plantName } = data;

    let title: string;
    let body: string;

    // Determine title based on urgency and count
    if (urgentCount > 0 && totalCount === 1) {
      title = plantName 
        ? `${plantName}: ${lang.urgent}`
        : lang.urgent;
    } else if (urgentCount > 0 && totalCount > 1) {
      title = plantName
        ? `${plantName}: ${lang.issuesWithUrgent.replace('{total}', totalCount.toString()).replace('{urgent}', urgentCount.toString())}`
        : lang.issuesWithUrgent.replace('{total}', totalCount.toString()).replace('{urgent}', urgentCount.toString());
    } else if (totalCount === 1) {
      title = plantName
        ? `${plantName}: ${lang.needsCare}`
        : lang.needsCare;
    } else {
      title = plantName
        ? `${plantName}: ${lang.issuesDetected.replace('{count}', totalCount.toString())}`
        : lang.issuesDetected.replace('{count}', totalCount.toString());
    }

    // Create body with issue details
    if (issues.length === 1) {
      body = issues[0];
    } else {
      body = issues.slice(0, 2).join(', ');
      if (issues.length > 2) {
        body += ` +${issues.length - 2} more`;
      }
    }

    // Generate advice based on issues
    const advice = this.generateAdvice(lang, issues);

    return { title, body, advice };
  }

  /**
   * Get localized content for specific sensor alerts
   */
  getSensorAlertContent(
    locale: string = 'en',
    sensorType: string,
    isUrgent: boolean = false,
    plantName?: string,
  ): NotificationContent {
    const lang = this.translations[locale] || this.translations.en;

    let title: string;
    let body: string;

    switch (sensorType) {
      case 'moisture':
        title = isUrgent ? lang.needsWaterUrgently : lang.timeToWater;
        body = isUrgent 
          ? 'Soil moisture is critically low'
          : 'Soil moisture is below optimal level';
        break;
      case 'light':
        title = lang.lightIssue;
        body = 'Light levels are outside optimal range';
        break;
      case 'temperature':
        title = lang.temperatureProblem;
        body = 'Temperature is outside safe range';
        break;
      case 'nutrients':
        title = lang.lowNutrients;
        body = 'Soil nutrient levels are low';
        break;
      case 'water_level':
        title = lang.waterLevelIssue;
        body = 'Water level sensor indicates an issue';
        break;
      default:
        title = lang.sensorAlert;
        body = 'Sensor reading requires attention';
    }

    if (plantName) {
      title = `${plantName}: ${title}`;
    }

    const advice = this.generateAdvice(lang, [sensorType]);

    return { title, body, advice };
  }

  /**
   * Generate advice based on detected issues
   */
  private generateAdvice(lang: any, issues: string[]): string {
    const adviceMap = {
      moisture: lang.adviceCheckMoisture,
      light: lang.adviceAdjustLight,
      temperature: lang.adviceTemperature,
      nutrients: lang.adviceNutrients,
      water_level: lang.adviceWaterLevel,
    };

    const relevantAdvice = issues
      .map(issue => adviceMap[issue])
      .filter(Boolean);

    if (relevantAdvice.length === 1) {
      return relevantAdvice[0];
    } else if (relevantAdvice.length > 1) {
      return relevantAdvice.slice(0, 2).join(' ');
    }

    return lang.adviceGeneral;
  }

  /**
   * Get supported locales
   */
  getSupportedLocales(): string[] {
    return Object.keys(this.translations);
  }

  /**
   * Check if locale is supported
   */
  isLocaleSupported(locale: string): boolean {
    return locale in this.translations;
  }
} 