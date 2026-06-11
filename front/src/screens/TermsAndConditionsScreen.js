import React from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../theme/AppTheme';
import { Ionicons as Icon } from '@expo/vector-icons';

const sections = [
  {
    title: '1. ACEPTACION DE LOS TERMINOS',
    body: 'Al registrarse y utilizar esta aplicación de subastas, el usuario acepta cumplir con los presentes Términos y Condiciones, así como con todas las leyes y regulaciones aplicables.',
  },
  {
    title: '2. REGISTRO DE USUARIOS',
    body: 'Para participar en las subastas, el usuario debe:',
    bullets: [
      'Proporcionar información veraz y actualizada',
      'Completar el proceso de verificación requerido',
      'Mantener la confidencialidad de sus credenciales',
      'La empresa se reserva el derecho de aprobar o rechazar cualquier solicitud de registro.',
    ],
  },
  {
    title: '3. CATEGORIAS DE USUARIO',
    body: 'Los usuarios serán clasificados en distintas categorías (Común, Especial, Plata, Oro y Platino), las cuales determinarán su nivel de acceso a las subastas. La categoría podrá modificarse en función de la actividad y comportamiento.',
  },
  {
    title: '4. PARTICIPACION EN SUBASTAS',
    body: 'Al participar en una subasta, el usuario acepta que:',
    bullets: [
      'Todas las ofertas (pujas) son vinculantes',
      'Solo podrá ofertar si cuenta con un medio de pago válido y verificado',
      'Debe respetar los incrementos mínimos y máximos definidos por la plataforma',
      'La empresa no se responsabiliza por errores en las ofertas realizadas por el usuario.',
    ],
  },
  {
    title: '5. ADJUDICACION DE BIENES',
    body: 'El usuario que realice la oferta más alta al cierre de la subasta será considerado ganador y se compromete a:',
    bullets: [
      'Abonar el monto ofertado',
      'Pagar comisiones o costos adicionales (enviar seguros, etc.)',
    ],
  },
  {
    title: '6. INCUMPLIMIENTO DE PAGO',
    body: 'En caso de incumplimiento:',
    bullets: [
      'Se aplicará una multa equivalente al 10% del valor ofertado',
      'El usuario será bloqueado hasta regularizar su situación',
      'La empresa podrá iniciar acciones legales correspondientes',
    ],
  },
  {
    title: '7. MEDIOS DE PAGO',
    body: 'El usuario debe registrar al menos un medio de pago válido para participar en subastas. La empresa se reserva el derecho de verificar los medios de pago y rechazar aquellos que no cumplan con los requisitos.',
  },
  {
    title: '8. PROPUESTA DE BIENES PARA SUBASTA',
    body: 'Al proponer un bien, el usuario reconoce que:',
    bullets: [
      'Es el legítimo propietario',
      'El bien no posee restricciones legales',
      'Puede aceptar o rechazar cualquier bien sin necesidad de justificar su decisión',
    ],
  },
  {
    title: '9. USO DE LA PLATAFORMA',
    body: 'El usuario se compromete a no realizar actividades fraudulentas, no manipular el sistema de pujas y no interferir con el funcionamiento de la plataforma. El incumplimiento podrá derivar en la suspensión o eliminación de la cuenta.',
  },
  {
    title: '10. RESPONSABILIDAD',
    body: 'La empresa actúa como intermediaria en las subastas y no garantiza la calidad ni la veracidad total de la información proporcionada por terceros.',
  },
  {
    title: '11. MODIFICACIONES',
    body: 'La empresa se reserva el derecho de modificar estos términos en cualquier momento. Las modificaciones serán notificadas a través de la aplicación.',
  },
  {
    title: '12. JURISDICCION',
    body: 'Cualquier conflicto será resuelto conforme a la legislación vigente en la jurisdicción correspondiente.',
  },
];

export default function TermsAndConditionsScreen({ navigation }) {
  const { colors } = useAppTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topSpacer} />
                    <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon
                name="arrow-back"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
        <Text style={[styles.title, { color: colors.text }]}>Terminos y Condiciones</Text>

        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
            <Text style={[styles.body, { color: colors.text }]}>{section.body}</Text>
            {section.bullets?.map((bullet) => (
              <Text key={bullet} style={[styles.bullet, { color: colors.text }]}>{`• ${bullet}`}</Text>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, marginTop: 40 },
  content: { paddingHorizontal: 18, paddingBottom: 24 },
  topSpacer: { height: 8 },
  logo: { width: 90, height: 90, resizeMode: 'contain', alignSelf: 'center' },
  title: { fontSize: 28, fontWeight: '500', marginTop: 8, marginBottom: 16 },
  section: { marginBottom: 14 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  body: { fontSize: 13, lineHeight: 18, marginBottom: 4 },
  bullet: { fontSize: 13, lineHeight: 18, marginLeft: 8 },
});
